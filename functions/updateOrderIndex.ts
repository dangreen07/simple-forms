import { UpdateChoiceOrderIndex } from "@/server/choices";
import { UpdateDateQuestionOrderIndex } from "@/server/dates";
import { UpdateRankingQuestionOrderIndex } from "@/server/rankingQuestions";
import { UpdateRatingQuestionOrderIndex } from "@/server/ratings";
import { UpdateTextQuestionOrderIndex } from "@/server/textQuestions";
import { question } from "@/server/types";

export const updateOrderIndex = async (question: question, newIndex: number) => {
  question.data.order_index = newIndex;
  switch (question.type) {
    case 'Choice':
      await UpdateChoiceOrderIndex(question.data.id, newIndex);
      break;
    case 'Text':
      await UpdateTextQuestionOrderIndex(question.data.id, newIndex);
      break;
    case 'Rating':
      await UpdateRatingQuestionOrderIndex(question.data.id, newIndex);
      break;
    case 'Date':
      await UpdateDateQuestionOrderIndex(question.data.id, newIndex);
      break;
    case 'Ranking':
      await UpdateRankingQuestionOrderIndex(question.data.id, newIndex);
      break;
    default:
      throw new Error('Unknown question type');
  }
};