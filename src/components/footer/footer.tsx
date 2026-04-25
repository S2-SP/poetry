import { useContext } from 'react'
import myContext from '../../context/data/myContext'

function Footer() {
  const context = useContext(
    myContext
  );
  const {mode} = context;
  return (
    <footer className='body-font' style={{background: mode == 'dark' ? 'rgb(30,41,59)' : '#000000'}}>
      <div className='container px-5 py-3 mx-auto flex items-center sm:flex-row flex-col'>
        <div className='flex title-font font-medium items-center md:justify-start justify-center text-gray-900'>
         
          <span className=" text-xl text-white">Gallery of words</span>
        </div>
        <p className='text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4'>
          <span className='text-white ml-1'> sefrina_pradhan © 2026 </span>
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          {/* Instagram */}
          <a className="text-gray-500 hover:text-white transition-colors" href='https://www.instagram.com/_sefrina_gallery/' target="_blank" rel="noopener noreferrer">
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <rect width={20} height={20} x={2} y={2} rx={5} ry={5} />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
            </svg>
          </a>
          {/* LinkedIn */}
          <a className="ml-3 text-gray-500 hover:text-white transition-colors" href="https://www.linkedin.com/in/sefrina-pradhan-34a36b1a6/" target="_blank" rel="noopener noreferrer">
            <svg
              fill="currentColor"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={0}
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                stroke="none"
                d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
              />
              <circle cx={4} cy={4} r={2} stroke="none" />
            </svg>
          </a>
        </span>
      </div>

    </footer>
  )
}

export default Footer