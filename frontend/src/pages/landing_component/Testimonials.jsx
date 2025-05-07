import React, { useEffect } from "react";
import pic1 from "../../assets/pic1.jpg";
import pic2 from "../../assets/pic2.jpg";
import pic3 from "../../assets/pic3.jpg";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles

const testimonials = [
  {
    id: 1,
    quote:
      "Donating through this platform was so easy and transparent. I could see exactly where my money was going!",
    author: "Humed Jemal",
    role: "Donor",
    image: pic1,
  },
  {
    id: 2,
    quote:
      "The support we received through this platform helped us reach more people in need. Truly grateful!",
    author: "Abinet Kebede",
    role: "NGO Representative",
    image: pic2,
  },
  {
    id: 3,
    quote:
      "I love how simple the process is. The ability to track my impact makes me feel connected to the cause.",
    author: "Tolassa Kebede",
    role: "Volunteer",
    image: pic3,
  },
];

const Testimonials = () => {
  // Initialize AOS when the component mounts
  useEffect(() => {
    AOS.init({ duration: 1200 }); // Initialize AOS with a custom duration
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2
          className="text-3xl font-bold text-center text-gray-800 mb-12"
          data-aos="fade-up" // Fade-up for the title
        >
          What People Are Saying
        </h2>
        <div className="flex overflow-x-scroll space-x-6 scrollbar-hide">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="min-w-[300px] bg-gray-100 shadow-lg rounded-lg p-6"
              data-aos="zoom-in" // Zoom-in effect for the cards
              data-aos-delay={`${testimonial.id * 200}`} // Delay based on the index of the card
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-bold">{testimonial.author}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
