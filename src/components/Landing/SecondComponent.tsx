'use client'
import React, { useEffect, useRef } from 'react';
import "@/styles/InfiniteScroll.css"

const SecondComponent = () => {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      addAnimation(scroller);
    }
  }, []);

  const addAnimation = (scroller) => {
    // Add data-animated attribute
    scroller.setAttribute("data-animated", true);

    const scrollerInner = scroller.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);

    // Duplicate each item
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  };

  return (
    <div className="secondcomponent">
      <div className="scroller" ref={scrollerRef} data-speed="slow" data-direction="left">
        <div className="scroller__inner">
          <div><h1>Medical Tent</h1></div>
          <div><h1>Regulators</h1></div>
          <div><h1>KN45 Mask</h1></div>
          <div><h1>Flowmeters</h1></div>
          <div><h1>Tri-Gas Adaptor</h1></div>
        </div>
      </div>
    </div>
  );
};

export default SecondComponent;
