import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaShippingFast, FaCheckCircle, FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';


const fruitImageUrl = 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg';

const commitments = [
    { icon: FaLeaf, text: 'Premium quality and freshness guaranteed', color: 'text-green-700' },
    { icon: FaShippingFast, text: 'Fast and reliable delivery across the country', color: 'text-blue-700' },
    { icon: FaCheckCircle, text: 'Eco-friendly and sustainable packaging', color: 'text-amber-700' },
    { icon: FaUsers, text: 'Excellent customer support', color: 'text-purple-700' },
];

function About() {
  return (
    <div className="relative bg-[#f9f1dd] min-h-screen p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-8 sm:p-12">
        <h1 className="text-4xl font-extrabold text-green-800 text-center mb-8">
          About Fruit Elegance
        </h1>

        <img 
          src={fruitImageUrl} 
          alt="Fresh Fruits" 
          className="w-full h-auto rounded-2xl object-cover mb-8 shadow-xl"
        />
        
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Welcome to <strong className="text-green-800">Fruit Elegance</strong>, your trusted online fruit store dedicated to delivering the freshest, highest-quality fruits right to your doorstep. Our passion is to provide a delightful shopping experience with seasonal, organic, and exotic fruits to choose from.
        </p>
        
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          At Fruit Elegance, we believe in sustainable farming, supporting local farmers, and promoting healthy living. Every piece of fruit is handpicked and carefully packed to ensure it reaches you in perfect condition.
        </p>
        
        <div className="my-10">
          <h2 className="text-3xl font-extrabold text-green-800 mb-6">Our Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commitments.map((commitment, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl shadow-sm">
                <div className={`p-4 rounded-full bg-white mb-4 ${commitment.color}`}>
                  <commitment.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{commitment.text}</h3>
              </div>
            ))}
          </div>
        </div>
        
        <div className="my-10">
          <h2 className="text-3xl font-extrabold text-green-800 mb-6">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl shadow-sm">
              <FaEnvelope className="text-green-700" size={24} />
              <p>support@fruitsmith.com</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl shadow-sm">
              <FaPhone className="text-green-700" size={24} />
              <p>+91 98765 43210</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl shadow-sm">
              <FaMapMarkerAlt className="text-green-700" size={24} />
              <p>456 Orchard Road, Green City, India</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-semibold">
                Go back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}

export default About;