import React, { useState } from 'react';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';




const categories = [
  { id: "all", label: "All" },
  { id: "accounts", label: "Accounts" },
  { id: "cards", label: "Cards" },
  { id: "investments", label: "Investments" },
  { id: "bills", label: "Bills" },
  { id: "mobileBanking", label: "Mobile Banking" },
  { id: "loans", label: "Loans" },
  { id: "remittance", label: "Remittance" },
  { id: "business", label: "Business" },
];


const AllProducts = () => {
    const [selectedCategory, setSelectedCategory] = useState("all");
    // const [loading, setLoading] = useState(true);

    const axiosPublic = useAxiosPublic();
    const {data: products=[], isPending: loading} =useQuery({
        queryKey: ["products"],
        queryFn: async()=>{
            const res = await axiosPublic.get("/products/allproducts");
            return res.data;
        }
    })
    console.log(products);


    const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category === selectedCategory);

  if (loading) return <div className="p-6 text-center">Loading products...</div>;


    return (
        <div className="p-6 max-w-7xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-6">Our Products</h1>
      <NavLink to="/create-account"><button className="pb-5 underline text-blue-500">Become A customer first</button></NavLink>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full border ${
              selectedCategory === cat.id ? "bg-blue-600 text-white" : "border-gray-400 text-gray-700"
            } hover:bg-blue-500 hover:text-white transition`}
          >
            {cat.label}
          </button>
          
        ))}
        
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredProducts.map(product => (
          <div key={product.productId} className="overflow-hidden rounded-t-lg ">
            <img
              src={product.image}
              alt={product.title}
              className="w-full object-cover mb-4 rounded"
            />
            <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
            <p className="text-gray-700 mb-4">{product.description}</p>

            {/* Details sections */}
            {product.details.services && product.details.services.length > 0 && (
              <section className="mb-3">
                <h3 className="font-semibold mb-1">Services</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {product.details.services.map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
                </ul>
              </section>
            )}

            {product.details.features && product.details.features.length > 0 && (
              <section className="mb-3">
                <h3 className="font-semibold mb-1">Features</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {product.details.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </section>
            )}

            {product.details.benefits && product.details.benefits.length > 0 && (
              <section className="mb-3">
                <h3 className="font-semibold mb-1">Benefits</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {product.details.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </section>
            )}

            {product.details.offers && product.details.offers.length > 0 && (
              <section>
                <h3 className="font-semibold mb-1">Offers</h3>
                <ul className="list-disc list-inside text-green-700 font-semibold">
                  {product.details.offers.map((offer, i) => (
                    <li key={i}>{offer}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-600 py-8">No products available in this category.</p>
        )}
      </div>
    </div>
    );
};

export default AllProducts;