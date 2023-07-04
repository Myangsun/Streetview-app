import React from "react";
import logo from "../logo192.png";

function Header() {
  return (
    <div className="fixed w-full top-0 z-50 bg-white flex items-center p-2 lg:px-5 shadow-md">
      {/* left */}
      <div className="flex items-center">
        <img src={logo} width={40} height={40} />
        <div className="flex ml-2 items-center rounded-full p-2">
          <h1 className="font-bold text-xl"> Streetview</h1>
        </div>
      </div>

      {/* log in */}
      {/* <div className="flex items-center sm:space-x-2 justify-end"> */}
      {/* profile pic */}
      {/* <img */}
      {/* //   onClick={signOut} */}
      {/* className="rounded-full curser-pointer" */}
      {/* src={user.image} */}
      {/* width={40} */}
      {/* height={40} */}
      {/* </img> */}
      {/* <p className="whitespace-nowrap font-semibold pr-3">{user.name}</p> */}
      {/* </div> */}
    </div>
  );
}

export default Header;
