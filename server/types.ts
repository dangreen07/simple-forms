export type question = {
    type: "Choice",
    data: {
        questionText: string,
        options: string[],
        editMode: boolean,
        questionNumber: number
    }
} | {
    type: "Text",
    data: {
        questionText: string
    }
};
