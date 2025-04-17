import React, { useState } from 'react'
import Register from './Register'
import Questions from './Questions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Rope from "./Rope";

const questions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 1
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Ag", "Fe", "Au", "Cu"],
    correctAnswer: 2
  },
  {
    question: "Which country has the largest population?",
    options: ["India", "China", "United States", "Indonesia"],
    correctAnswer: 0
  },
  {
    question: "What is the hardest natural substance?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctAnswer: 2
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    correctAnswer: 2
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Silver", "Oxygen", "Iron"],
    correctAnswer: 2
  }
];

const Quiz = () => {
  const [registered, setRegistered] = useState(localStorage.getItem("register") === "true")
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1); // 1 for team 1, 2 for team 2

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      if (currentTeam === 1) {
        setTeam1Score(prev => prev + 1);
      } else {
        setTeam2Score(prev => prev + 1);
      }
    }

    // Switch teams
    setCurrentTeam(current => current === 1 ? 2 : 1);

    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Reset to first question if we've gone through all questions
      setCurrentQuestion(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <Rope
        team1Score={team1Score}
        team2Score={team2Score}
        setTeam1Score={setTeam1Score}
        setTeam2Score={setTeam2Score}
      />

      <Card className="bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle className="text-center">
            {currentTeam === 1
              ? localStorage.getItem("team1") || "Team 1"
              : localStorage.getItem("team2") || "Team 2"}'s Turn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-xl font-semibold text-center">
            {questions[currentQuestion].question}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full p-4 text-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Quiz