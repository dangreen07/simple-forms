export type question = {
    type: "Choice",
    data: ChoiceData
} | {
    type: "Text",
    data: TextData
};

export type ChoiceData = {
    choiceId: number,
    questionText: string,
    options: OptionsData[],
    editMode: boolean,
    order_index: number
};

export type OptionsData = {
    option_id: number,
    option: string,
    order_index: number
}

export type TextData = {
    questionText: string,
    order_index: number
}