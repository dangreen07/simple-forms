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
    options: string[],
    editMode: boolean
};

export type TextData = {
    questionText: string
}