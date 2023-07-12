import React from "react";
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

function Submit() {
  let navigate = useNavigate();
  const routeChange = (e) => {
    let path = `/gradioapp`;

    navigate(path);
    navigate(0);
  };

  return (
    <div>
      <ArrowRightCircleIcon
        className="h-16 w-16 text-blue-500 mr-2 bottom-14 z-50"
        onClick={routeChange}
      />
    </div>
  );
}
export default Submit;
