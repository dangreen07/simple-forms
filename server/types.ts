export type question = {
    type: "Choice",
    data: ChoiceData
} | {
    type: "Text",
    data: TextData
} | {
    type: 'Rating',
    data: RatingData
};

export type ChoiceData = {
    id: number,
    questionText: string,
    options: OptionsData[],
    editMode: boolean,
    order_index: number
};

export type OptionsData = {
    id: number,
    option: string,
    order_index: number
}

export type TextData = {
    id: number,
    questionText: string,
    order_index: number
}

export type RatingData = {
    id: number,
    questionText: string,
    ratingsLevel: number,
    order_index: number
}