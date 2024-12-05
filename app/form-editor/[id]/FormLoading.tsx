export default function FormLoading() {
    return (
        <div className="flex justify-center flex-grow">
            <div className="bg-neutral-100 max-w-6xl flex-grow mb-6 rounded-lg flex justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    )
}