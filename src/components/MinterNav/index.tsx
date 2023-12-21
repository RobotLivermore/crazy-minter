import Link from "next/link";
import React from "react";

const MinterNav = () => {
  return (
    <div className="flex flex-col h-full w-[400px]">
      <h1 className="text-4xl font-bold">铭文铸造器列表</h1>
      <ul
        className="flex flex-col mt-8 space-y-4"
        style={{
          listStyle: "inside",
        }}
      >
        <li>
          <Link className="underline" href="/seis">
            seis
          </Link>
        </li>
        <li>
          <Link className="underline" href="/injs">
            injs
          </Link>
        </li>
        <li>
          <Link className="underline" href="/dota">
            dota
          </Link>
        </li>
        <li>
          <Link className="underline" href="/avascriptions">
            Avascriptions
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MinterNav;
