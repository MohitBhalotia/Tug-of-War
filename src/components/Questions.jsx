import React, { useState, useEffect } from "react";
import questions from "../../questions_40.json";
import TugOfWarQuiz from "./TugOfWar";

const Questions = () => {
  const [questionsMain, setQuestions] = useState([]);
  const [question1, setQuestion1] = useState({});
  const [selected1, setSelected1] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrectTeam, setLastCorrectTeam] = useState(null);

  const [arr, setArr] = useState([]);
  const [teamTurn, setTeamTurn] = useState(true); // true = Team 1, false = Team 2
  const [scoreTeam1, setScoreTeam1] = useState(0);
  const [scoreTeam2, setScoreTeam2] = useState(0);
  const [chooseteam, setchooseteam] = useState("");
  const [voted, setvoted] = useState(false);

  const [loading, setloadingnext] = useState(false);
  const [countdown, setCountdown] = useState(5);



  const team1name = localStorage.getItem("team1");
  const team2name = localStorage.getItem("team2");
  useEffect(() => {
    // Load existing scores and used questions from localStorage
    const savedTeam1 = parseInt(localStorage.getItem("team1Score")) || 0;
    const savedTeam2 = parseInt(localStorage.getItem("team2Score")) || 0;
    const savedQuestions =
      JSON.parse(localStorage.getItem("prevquestions")) || [];

    setScoreTeam1(savedTeam1);
    setScoreTeam2(savedTeam2);
    setArr(savedQuestions);
  }, []);

  const fetchQuestion = () => {
    const allQuestions = questions.technical_questions_json.quiz;
    setQuestions(allQuestions);

    const length = allQuestions.length;
    let prevquestions = JSON.parse(localStorage.getItem("prevquestions")) || [];

    // Reset if all questions used
    if (prevquestions.length >= length) {
      prevquestions = [];
      localStorage.removeItem("prevquestions");
    }

    let q1index = Math.floor(Math.random() * length);
    while (prevquestions.includes(q1index)) {
      q1index = Math.floor(Math.random() * length);
    }

    // Update localStorage and state
    const updatedArr = [...prevquestions, q1index];
    localStorage.setItem("prevquestions", JSON.stringify(updatedArr));
    setArr(updatedArr);

    setQuestion1(allQuestions[q1index]);
    setSelected1("");
    setSubmitted(false);
    setLastCorrectTeam(null); // Reset the last correct team when fetching new question
  };

  const handleSubmit = () => {
    if (selected1 === question1.options[question1.correctOption]) {
      if (chooseteam === "team1") {
        setScoreTeam1((prev) => {
          const updated = prev + 1;
          localStorage.setItem("team1Score", updated);
          return updated;
        });
        setLastCorrectTeam("A");
      } else if (chooseteam === "team2") {
        setScoreTeam2((prev) => {
          const updated = prev + 1;
          localStorage.setItem("team2Score", updated);
          return updated;
        });
        setLastCorrectTeam("B");
      }
    } else {
      setLastCorrectTeam(null);
    }

    setSubmitted(true);
    setloadingnext(true);
    setCountdown(10);

    let interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          fetchQuestion();
          setTeamTurn((prev) => !prev);
          setvoted(false);
          setloadingnext(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const voteteam1 = () => {
    setchooseteam("team1");
    // console.log("team 1")
    setvoted(true);
  };
  const voteteam2 = () => {
    setchooseteam("team2");
    setvoted(true);
  };

  return (
    <div className="text-gray-700 p-4 max-w-xl mx-auto">
      <TugOfWarQuiz teamAnswering={lastCorrectTeam} />

      <p className="mb-4">
        🟦 Team {team1name} Score: {scoreTeam1} | 🟥 Team {team2name} Score: {scoreTeam2}
      </p>

      <button
        onClick={fetchQuestion}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {question1 ? <div>Start Quiz main</div> : <div>Start Quiz</div>}
      </button>

      {question1?.question && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 ">Question:</h3>
          <p className="mb-4">{question1.question}</p>
          {question1.options?.map((opt, index) => (
            <div key={index} className="mb-2 ">
              <label>
                <input
                  type="radio"
                  name="q1"
                  value={opt}
                  checked={selected1 === opt}
                  onChange={(e) => setSelected1(e.target.value)}
                  disabled={submitted}
                />{" "}
                {opt}
              </label>
            </div>
          ))}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-400  ">
              Choose Team:
            </h3>
            {/* <select name="" id=""> */}
            <button
              className={` text-white px-4 py-2 rounded hover:bg-blue-700 m-2 cursor-pointer ${voted && chooseteam === "team1"
                ? "bg-gray-500 border-2 border-white"
                : "bg-blue-600"
                }`}
              onClick={voteteam1}
            >
              {team1name}
            </button>
            <button
              className={` text-white px-4 py-2 rounded hover:bg-red-500 m-2 cursor-pointer ${voted && chooseteam === "team2"
                ? "bg-gray-500 border-2 border-white"
                : "bg-red-600"
                } `}
              onClick={voteteam2}
            >
              {team2name}
            </button>
          </div>
        </div>
      )}

      {question1?.question && (
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
          disabled={submitted || !selected1 || !chooseteam}
        >
          Submit Answer
        </button>
      )}



      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            fontSize: "2rem",
            color: "#333",
          }}
        >
          {/* choosen team is {chooseteam} */}
          <p>Next question in: {countdown}</p>
          {submitted && (
            <div className="mt-6">
              <h4 className="text-md font-bold">Results:</h4>
              <p className="mt-2">
                Q: You answered: <strong>{selected1}</strong> —{" "}
                {selected1 === question1.options[question1.correctOption] ? (
                  <>
                    ✅ Correct +1 for{" "}
                    <strong>
                      {chooseteam === "team1" ? team1name : team2name}

                    </strong>
                    <p>Explanation : {question1.explanation}</p>
                  </>
                ) : (
                  <>
                    ❌ Incorrect
                    <br />
                    Correct Answer : {" "}
                    <strong>
                      {question1.options[question1.correctOption]}
                    </strong>
                    <p>Explanation : {question1.explanation}</p>

                  </>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Questions;
