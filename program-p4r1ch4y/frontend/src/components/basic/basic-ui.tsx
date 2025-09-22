'use client'

export function BasicCreate() {
  return (
    <div className="space-y-4">
      <button className="btn btn-disabled" disabled>
        Run Program (Not Available)
      </button>
      <div className="alert alert-info">
        <div>
          <h3 className="font-bold">Basic Program Not Deployed</h3>
          <p>The basic program is not deployed on this network. Only the Daily Idea Spark program is available.</p>
          <p className="mt-2">
            <strong>Available Program:</strong> Daily Idea Spark - A creative journaling dApp for tracking daily ideas and building streaks.
          </p>
        </div>
      </div>
    </div>
  )
}

export function BasicProgram() {
  return (
    <div className="space-y-6">
      <div className="alert alert-info">
        <div>
          <h3 className="font-bold">Program Information</h3>
          <p>The basic program is not deployed on this network.</p>
          <p className="mt-2">
            <strong>Available:</strong> Daily Idea Spark Program
            <br />
            <strong>Program ID:</strong> FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv
          </p>
        </div>
      </div>
    </div>
  )
}
