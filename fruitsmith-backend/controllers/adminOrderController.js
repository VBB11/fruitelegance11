// adminOrderController.js
const Order = require('../models/Order');

// =================================================================
// 1. GET ALL ORDERS (FIXED/ROBUST SEARCH IMPLEMENTATION)
// =================================================================
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page, limit, search, startDate, endDate } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    // --- Initial Match Stage (for status and date filters) ---
    let matchStage = {};
    
    if (status) {
      matchStage.status = status;
    }
    
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

    // --- Aggregation Pipeline for Search, Filtering, and Pagination ---
    let pipeline = [];
    
    // 1. $MATCH: Apply status and date filters first
    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }
    
    // 2. $LOOKUP: Attach user data (essential for searching by name/email)
    pipeline.push({
        $lookup: {
            from: 'users', // **CRITICAL: Ensure this matches your Users collection name**
            localField: 'userId',
            foreignField: '_id',
            as: 'userId' // Overwrite the userId field with the full user object
        }
    });

    // 3. $UNWIND: Flatten the user array (since we only expect one match)
    pipeline.push({
        $unwind: { path: '$userId', preserveNullAndEmptyArrays: true }
    });

    // 4. $MATCH (Search): Apply the text search across multiple fields
    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
        
        pipeline.push({
            $match: {
                $or: [
                    // Search by Order ID (using string conversion for compatibility)
                    { _id: { $eq: search.length === 24 ? new Order(search) : null } },
                    
                    // Search by partial Order ID (string-based)
                    { _id: { $regex: searchRegex } }, 

                    // Search by User Name
                    { 'userId.name': { $regex: searchRegex } }, 

                    // Search by User Email
                    { 'userId.email': { $regex: searchRegex } }
                ]
            }
        });
    }

    // --- COUNT TOTAL DOCUMENTS (FOR PAGINATION) ---
    const totalCountPipeline = [...pipeline]; // Copy the current filtering stages
    totalCountPipeline.push({ $count: 'total' });
    
    const totalCountResult = await Order.aggregate(totalCountPipeline);
    const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;


    // 5. $SORT, $SKIP, $LIMIT (Pagination)
    pipeline.push(
        { $sort: { orderDate: -1 } },
        { $skip: skip },
        { $limit: limitNum }
    );
    
    // 6. Execute the main pipeline
    const orders = await Order.aggregate(pipeline);


    res.json({ 
        orders, 
        totalCount, 
        page: pageNum, 
        pages: Math.ceil(totalCount / limitNum) 
    });
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
    // Note: If you switch getAllOrders to aggregation, you might also update getOrderById 
    // to use aggregation if the frontend needs deeply populated data for consistency.
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