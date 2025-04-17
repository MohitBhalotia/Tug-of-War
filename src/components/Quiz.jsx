import React, { useState } from "react";
import Register from "./Register";
import Questions from "./Questions";

const Quiz = ({ setAuth }) => {
  const [registered, setRegistered] = useState(
    localStorage.getItem("register") === "true"
  );

  return (
    <div>
      {registered ? (
        <Questions setAuth={setAuth} setRegistered={setRegistered} />
      ) : (
        <Register setRegistered={setRegistered} />
      )}
    </div>
  );
};

export default Quiz;
