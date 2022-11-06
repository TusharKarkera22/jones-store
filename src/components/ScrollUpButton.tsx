import ShoePrint from "@Images/jordan-shoe-print.png";
import useScrollTop from "@Lib/hooks/useScrollTop";
import Image from "next/image";

import { useRef } from "react";

export function ScrollUpButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollTop = useScrollTop();

  if (buttonRef.current) {
    buttonRef.current.style.setProperty(
      "--animation-duration-offset",
      (
        scrollTop /
        (document.documentElement.scrollHeight - innerHeight)
      ).toString()
    );
  }

  return (
    <button
      onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
      ref={buttonRef}
      className="scroll-up"
    >
      <div className="scroll-up__container">
        <Image
          layout="responsive"
          className="scroll-up__image scroll-up__image--flipped"
          alt=""
          unoptimized={true}
          width={211}
          height={559}
          src={ShoePrint}
        />
      </div>
      <div className="scroll-up__container">
        <Image
          layout="responsive"
          className="scroll-up__image"
          alt=""
          unoptimized={true}
          width={211}
          height={559}
          src={ShoePrint}
        />
      </div>
    </button>
  );
}