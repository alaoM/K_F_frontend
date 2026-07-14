"use client";

export default function OfferMarquee() {
  const texts = [
    "Never out of style",
    "Let's love fashion",
    "Your favorite products made affordable for you",
    "Fashion that reflects who you are",
    "Celebrate a big savings on this sale",
    "Get the best deal for almost everything",
  ];

  return (
    <section className="bg-[#f8f5f0] py-1 overflow-hidden">
      <div className="relative flex w-full overflow-hidden group">

        <ul className="flex items-center whitespace-nowrap">
          <li className="flex animate-marquee1 group-hover:[animation-play-state:paused]">
            {texts.map((text, i) => (
              <span key={i} className="marquee-text">
                {text}
              </span>
            ))}
          </li>

          <li className="flex animate-marquee2 group-hover:[animation-play-state:paused]">
            {texts.map((text, i) => (
              <span key={i} className={`marquee-text ${i === 0 ? "ml-8" : ""}`}>
                {text}
              </span>
            ))}
          </li>
        </ul>

      </div>
    </section>
  );
}
