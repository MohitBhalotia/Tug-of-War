import React, { useState, useEffect } from "react";
import questions from "../../questions_40.json";
import TugOfWarQuiz from "./TugOfWar";

const Questions = ({ setAuth, setRegistered }) => {
  const [questionsMain, setQuestions] = useState([]);
  const [question1, setQuestion1] = useState({});
  const [selected1, setSelected1] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrectTeam, setLastCorrectTeam] = useState(null);
  const [tugOfWarWinner, setTugOfWarWinner] = useState(null);

  const [arr, setArr] = useState([]);
  const [teamTurn, setTeamTurn] = useState(true); // true = Team 1, false = Team 2
  const [scoreTeam1, setScoreTeam1] = useState(0);
  const [scoreTeam2, setScoreTeam2] = useState(0);
  const [chooseteam, setchooseteam] = useState("");
  const [voted, setvoted] = useState(false);

  const [loading, setloadingnext] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const team1name = localStorage.getItem("team1");
  const team2name = localStorage.getItem("team2");

  const [refresh, setrefresh] = useState(false);

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

  // Listen for winner changes from TugOfWar component
  useEffect(() => {
    const checkWinner = () => {
      const ropePosition = parseInt(localStorage.getItem("ropePosition")) || 0;
      if (ropePosition <= -50) {
        setTugOfWarWinner(team1name);
      } else if (ropePosition >= 50) {
        setTugOfWarWinner(team2name);
      } else {
        setTugOfWarWinner(null);
      }
    };

    // Check initially
    checkWinner();

    // Set up an interval to check periodically
    const interval = setInterval(checkWinner, 1000);

    return () => clearInterval(interval);
  }, [team1name, team2name]);

  const handleResetQuiz = () => {
    // Clear registration and team data
    localStorage.removeItem("register");
    localStorage.removeItem("team1");
    localStorage.removeItem("team2");
    localStorage.removeItem("team1Score");
    localStorage.removeItem("team2Score");
    localStorage.removeItem("prevquestions");
    localStorage.removeItem("ropePosition");
    setRegistered(false);
    window.location.replace(window.location.href);
  };

  const handleLogout = () => {
    // Clear everything from localStorage
    localStorage.clear();
    setAuth(false);

    window.location.replace(window.location.href);
  };

  const handleRestartQuiz = () => {
    // Reset scores and rope position
    localStorage.setItem("team1Score", "0");
    localStorage.setItem("team2Score", "0");
    localStorage.removeItem("ropePosition");
    localStorage.removeItem("prevquestions");
    setScoreTeam1(0);
    setScoreTeam2(0);
    setLastCorrectTeam(null);
    setTugOfWarWinner(null);
    window.location.replace(window.location.href);
  };

  const fetchQuestion = () => {
    setrefresh(true);
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

    // Add delay before showing overlay to allow rope animation
    setTimeout(() => {
      setloadingnext(true);

      // Only start countdown if there's no winner
      if (!tugOfWarWinner) {
        setCountdown(10);
        setIsPaused(false);

        const newInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(newInterval);
              fetchQuestion();
              setTeamTurn((prev) => !prev);
              setvoted(false);
              setloadingnext(false);
              return 10;
            }
            return prev - 1;
          });
        }, 1000);
        setIntervalId(newInterval);
      }
    }, 2000);
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume timer
      const newInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(newInterval);
            fetchQuestion();
            setTeamTurn((prev) => !prev);
            setvoted(false);
            setloadingnext(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(newInterval);
    } else {
      // Pause timer
      clearInterval(intervalId);
    }
    setIsPaused(!isPaused);
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const voteteam1 = () => {
    setchooseteam("team1");
    setvoted(true);
  };

  const voteteam2 = () => {
    setchooseteam("team2");
    setvoted(true);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full px-2 py-2">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Team A Column */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg p-2">
            <div className="text-center">
              <h2 className="text-xl font-bold text-blue-600 mb-1">{team1name}</h2>
              <div className="text-4xl font-bold text-blue-700">{scoreTeam1}</div>
              <p className="text-blue-500 text-sm">Points</p>
            </div>
          </div>

          {/* Middle Column - Game Content */}
          <div className="col-span-8 flex flex-col">
            {/* Action Buttons */}
            <div className="flex justify-center gap-2 mb-2">
              <button
                onClick={handleRestartQuiz}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
              >
                Restart Quiz
              </button>
              <button
                onClick={handleResetQuiz}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
              >
                Reset Quiz
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md transition-all duration-200"
              >
                Logout
              </button>
            </div>

            {/* Tug of War Component */}
            <div className="mb-2">
              <TugOfWarQuiz teamAnswering={lastCorrectTeam} />
            </div>

            {/* Start Quiz Button */}
            <div className="flex justify-center items-center my-2">
              <button
                onClick={fetchQuestion}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-lg hover:bg-blue-700 transition-colors ${refresh ? "hidden" : "block"
                  }`}
              >
                Start Quiz
              </button>
            </div>

            {/* Question Section */}
            {question1?.question && (
              <div className="bg-white rounded-lg shadow-lg p-3 flex-1 overflow-y-auto px-10">
                <h3 className="text-lg font-bold text-gray-800 mb-1 py-2 ">Question:</h3>
                <p className="text-base text-gray-700 mb-2">{question1.question}</p>

                {/* Options */}
                <div className="space-y-1 mb-2">
                  {question1.options?.map((opt, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-2 rounded-lg border-2 cursor-pointer transition-colors ${selected1 === opt
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="q1"
                        value={opt}
                        checked={selected1 === opt}
                        onChange={(e) => setSelected1(e.target.value)}
                        disabled={submitted}
                        className="mr-2 h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>

                {/* Team Selection */}
                <div className="mb-2 mt-4">
                  <h3 className="text-base font-semibold text-gray-700 mb-1 mt-2">
                    Choose Team to Answer:
                  </h3>
                  <div className="flex gap-10 px-10 mt-4">
                    <button
                      className={`flex-1 py-2  rounded-lg text-white text-sm font-semibold transition-colors ${voted && chooseteam === "team1"
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      onClick={voteteam1}
                    >
                      {team1name}
                    </button>
                    <button
                      className={`flex-1 py-2  rounded-lg text-white text-sm font-semibold transition-colors ${voted && chooseteam === "team2"
                          ? "bg-gray-400"
                          : "bg-red-600 hover:bg-red-700"
                        }`}
                      onClick={voteteam2}
                    >
                      {team2name}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center mt-2">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={submitted || !selected1 || !chooseteam}
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Team B Column */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg p-2">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-1">{team2name}</h2>
              <div className="text-4xl font-bold text-red-700">{scoreTeam2}</div>
              <p className="text-red-500 text-sm">Points</p>
            </div>
          </div>
        </div>

        {/* Results Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-3xl w-full">
              {tugOfWarWinner ? (
                <div className="text-center py-4">
                  <h2 className="text-4xl font-bold mb-2">
                    {tugOfWarWinner} Wins!
                  </h2>
                  <p className="text-xl text-gray-700 mb-4">
                    Final Score: {scoreTeam1} - {scoreTeam2}
                  </p>
                  <button
                    onClick={handleRestartQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xl font-bold text-gray-800">
                      Next question in: <span className="text-blue-600">{countdown}</span>
                    </p>
                    <button
                      onClick={togglePause}
                      className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  </div>

                  {submitted && (
                    <div className="mt-2">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Results:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-base mb-1">
                          Your answer: <strong className="text-gray-800">{selected1}</strong>
                        </p>
                        {selected1 === question1.options[question1.correctOption] ? (
                          <div className="text-green-600">
                            <p className="text-lg font-bold mb-1">✅ Correct!</p>
                            <p className="text-base mb-1">
                              +1 point for{" "}
                              <strong className="text-gray-800">
                                {chooseteam === "team1" ? team1name : team2name}
                              </strong>
                            </p>
                            <p className="text-sm text-gray-700">{question1.explanation}</p>
                          </div>
                        ) : (
                          <div className="text-red-600">
                            <p className="text-lg font-bold mb-1">❌ Incorrect</p>
                            <p className="text-base mb-1">
                              Correct answer:{" "}
                              <strong className="text-gray-800">
                                {question1.options[question1.correctOption]}
                              </strong>
                            </p>
                            <p className="text-sm text-gray-700">{question1.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
