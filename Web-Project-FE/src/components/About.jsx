// import { useEffect } from 'react';

const About = () => {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">About CookEase</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-orange-500 mb-6">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            CookEase aims to make cooking enjoyable, as we believe it contributes to a healthy lifestyle for individuals, communities, and the environment. Our platform connects home cooks worldwide to share recipes and culinary ideas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;