export type question = {
    type: "Choice",
    data: ChoiceData
} | {
    type: "Text",
    data: TextData
} | {
    type: 'Rating',
    data: RatingData
} | {
    type: 'Date',
    data: DateData
} | {
    type: 'Ranking',
    data: RankingData
}

export type questionResponse = {
    type: "Choice" | "Text" | 'Rating' | 'Date' | 'Ranking',
    id: number,
    response: string
}

export type ChoiceData = {
    id: number,
    questionText: string,
    options: OptionsData[],
    order_index: number,
    required: boolean,
    editable: boolean
};

export type OptionsData = {
    id: number,
    option: string,
    order_index: number
}

export type TextData = {
    id: number,
    questionText: string,
    order_index: number,
    required: boolean,
    editable: boolean
}

export type RatingData = {
    id: number,
    questionText: string,
    ratingsLevel: number,
    order_index: number,
    required: boolean,
    editable: boolean
}

export type DateData = {
    id: number,
    questionText: string,
    order_index: number,
    required: boolean,
    editable: boolean
}

export type RankingData = {
    id: number,
    questionText: string,
    rankOptions: RankOptionData[],
    order_index: number,
    required: boolean,
    editable: boolean
}

export type RankOptionData = {
    id: number,
    option: string,
    order_index: number
}

export type clientResponse = {
    questionID: number,
    questionType: "Choice",
    response: number
} | {
    questionID: number,
    questionType: "Text",
    response: string
} | {
    questionID: number,
    questionType: "Rating",
    response: number
} | {
    questionID: number,
    questionType: "Date",
    response: Date
} | {
    questionID: number,
    questionType: "Ranking",
    response: number[]
}