import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

function Submit() {
  let navigate = useNavigate();
  const routeChange = (e) => {
    //后端 location + timestamp
    // key usesession:user id "str"
    let path = `/gradioapp`;

    navigate(path);
    navigate(0);
  };
  return (
    <div>
      <PlusCircleIcon
        className="fixed h-16 w-16 text-blue-500 right-8 bottom-12 z-50"
        onClick={routeChange}
      />
    </div>
  );
}
export default Submit;
