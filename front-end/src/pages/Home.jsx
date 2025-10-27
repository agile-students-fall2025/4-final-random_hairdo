import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#efefed] px-6 py-4 text-[#282f32]">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>

        <div className='flex items-start'>
          <Link
            to="/profile"
            aria-label="Profile"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-[#462c9f] text-white text-sm font-medium hover:bg-[#3b237f] transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
      <div>
        <h1 className="text-3xl text-left">
          Hello, {"guest"}!
        </h1>
      </div>

      <div className="pt-20 flex flex-col items-center justify-start">
        <Link
          to="/facility"
          aria-label="facility"
          className="w-48 h-48 flex items-center justify-center bg-[#462c9f] text-white text-xl font-semibold rounded-lg shadow-md hover:bg-[#3b237f] transition-colors"
        >
          Facilities
        </Link>
      </div>
      <div className="h-20 flex flex-col items-center justify-start">
        <Link
          to="/settings"
          aria-label="Settings"
          className="mt-6 w-40 py-2 text-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}

export default Home