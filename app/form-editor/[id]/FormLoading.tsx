export default function FormLoading() {
    return (
        <div className="flex justify-center flex-grow bg-gradient-to-b from-blue-300 to-green-300 bg-fixed">
            <div className="max-w-6xl flex-grow mb-6 rounded-lg flex justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    )
}