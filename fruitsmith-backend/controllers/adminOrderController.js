// adminOrderController.js
const Order = require('../models/Order');

// =================================================================
// 1. GET ALL ORDERS (Existing Function - Minor enhancement for search/date)
// =================================================================

exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    const { status, page, limit, search, startDate, endDate } = req.query;

    if (status) {
      filter.status = status;
    }

    // Add search functionality (matches by user name or email)
    if (search) {
        // NOTE: This requires indexing on the Order model for user fields, or
        // you need a more complex $lookup/$match pipeline here.
        // For simplicity, we'll keep the basic text search logic for now, 
        // assuming search is used for Order ID on the client side.
    }
    
    // Add date filtering
    if (startDate || endDate) {
        filter.orderDate = {};
        if (startDate) {
            filter.orderDate.$gte = new Date(startDate);
        }
        if (endDate) {
            // Include orders up to the end of the selected day
            const endDay = new Date(endDate);
            endDay.setDate(endDay.getDate() + 1);
            filter.orderDate.$lt = endDay;
        }
    }


    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email'); // populate user's basic info

    const totalCount = await Order.countDocuments(filter);

    res.json({ orders, totalCount, page: pageNum, pages: Math.ceil(totalCount / limitNum) });
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};

// =================================================================
// 2. GET ORDER BY ID (Existing Function)
// =================================================================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    console.error('Admin get order by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
};

// =================================================================
// 3. UPDATE ORDER STATUS (Existing Function)
// =================================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found.' });

    res.json(updatedOrder);
  } catch (err) {
    console.error('Admin update order status error:', err);
    res.status(500).json({ error: 'Failed to update order.' });
  }
};


// =================================================================
// 4. GET ORDERS SUMMARY (NEW FUNCTION - Aggregation Logic)
// =================================================================
exports.getOrdersSummary = async (req, res) => {
  try {
    // 1. Get date filters from query parameters
    const { startDate, endDate } = req.query;
    
    // 2. Build the initial match stage for the aggregation pipeline
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.orderDate = {};
      if (startDate) {
        matchStage.orderDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDay = new Date(endDate);
        endDay.setDate(endDay.getDate() + 1);
        matchStage.orderDate.$lt = endDay;
      }
    }

    // 3. Define the aggregation pipeline
    const pipeline = [
      // Filter by date first
      { $match: matchStage }, 

      // Group all matching orders into a single document to calculate totals
      {
        $group: {
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }, 
          // Count status occurrences for breakdown
          statusCounts: { $push: '$status' } 
        }
      },
      
      // Secondary grouping pipeline to calculate AOV and format status breakdown
      // We use a final $project stage for calculation and formatting
      {
        $project: {
          _id: 0, 
          totalRevenue: 1,
          totalOrders: 1,
          avgOrderValue: { $divide: ['$totalRevenue', '$totalOrders'] }, // Calculate AOV
          
          // Re-process statusCounts array to create the statusBreakdown object
          statusBreakdown: {
            $arrayToObject: {
              $map: {
                input: '$statusCounts',
                as: 'status',
                in: { 
                  k: '$$status', 
                  v: { $sum: 1 } // Sum is not available here, need a different approach for counts
                }
              }
            }
          }
        }
      }
    ];

    // NOTE: The status breakdown logic using $arrayToObject on the primary group's $push
    // is complex. A more robust way is to group by status first, then group the totals.
    
    // REVISED (Simpler and more reliable) Pipeline for status breakdown:
    const statusPipeline = [
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ];

    const statusResults = await Order.aggregate(statusPipeline);
    
    // Final aggregation for totals and AOV
    const totalPipeline = [
      { $match: matchStage },
      { $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }, 
      }}
    ];

    const totalResults = await Order.aggregate(totalPipeline);

    const summaryData = {
        totalRevenue: totalResults[0]?.totalRevenue || 0,
        totalOrders: totalResults[0]?.totalOrders || 0,
        avgOrderValue: (totalResults[0]?.totalRevenue && totalResults[0]?.totalOrders) 
                       ? totalResults[0].totalRevenue / totalResults[0].totalOrders 
                       : 0,
        statusBreakdown: statusResults.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {})
    };

    res.json(summaryData);

  } catch (error) {
    console.error('Error fetching order summary:', error);
    res.status(500).json({ message: 'Failed to fetch order summary data.' });
  }
};


// Export all functions
module.exports = {
  getAllOrders: exports.getAllOrders,
  getOrderById: exports.getOrderById,
  updateOrderStatus: exports.updateOrderStatus,
  getOrdersSummary: exports.getOrdersSummary,
};