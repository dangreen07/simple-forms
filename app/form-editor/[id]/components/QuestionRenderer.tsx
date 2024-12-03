import React from 'react';
import { DraggableProvided } from "@hello-pangea/dnd";
import { question } from "@/server/types";
import { updateOrderIndex } from '@/functions/updateOrderIndex';

const ChoiceQuestionComponent = React.lazy(() => import('./ChoiceQuestionComponent'));
const TextQuestionComponent = React.lazy(() => import('./TextQuestionComponent'));
const RatingQuestionComponent = React.lazy(() => import('./RatingQuestionComponent'));
const DateQuestionComponent = React.lazy(() => import('./DateQuestionComponent'));
const RankingQuestionComponent = React.lazy(() => import('./RankingQuestionComponent'));

interface QuestionRendererProps {
  question: question;
  index: number;
  justCreatedIndex: number;
  questions: question[];
  setQuestions: React.Dispatch<React.SetStateAction<question[]>>;
  provided: DraggableProvided;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  index,
  justCreatedIndex,
  questions,
  setQuestions,
  provided,
}) => {
  // Update order index if necessary (you might want to move this logic elsewhere)
  if (question.data.order_index !== index) {
    const copy = [...questions];
    copy[index].data.order_index = index;
    setQuestions(copy);
    // Update the database based on question type
    updateOrderIndex(question, index);
  }

  const commonProps = {
    questions,
    setQuestions,
    index,
    justCreated: index === justCreatedIndex,
    provided,
  };

  switch (question.type) {
    case 'Choice':
      return <ChoiceQuestionComponent key={index} {...commonProps} />;
    case 'Text':
      return <TextQuestionComponent key={index} {...commonProps} />;
    case 'Rating':
      return <RatingQuestionComponent key={index} {...commonProps} />;
    case 'Date':
      return <DateQuestionComponent key={index} {...commonProps} />;
    case 'Ranking':
      return <RankingQuestionComponent key={index} {...commonProps} />;
    default:
      return null;
  }
};

export default QuestionRenderer;