import { useContext } from 'react'
import myContext from '../../context/data/myContext';

function HeroSection() {

  const context = useContext(myContext);
  const {mode} = context;

  return (
    <section style={{ background: mode === 'dark' ? 'rgb(30, 41, 59)' : '#ffffff' }}>
      <div className="container mx-auto flex px-5 py-10 items-center justify-center flex-col">
        <main>
          <div className="text-center">
            <div className="mb-2">
              
              <h1 className=' text-3xl  font-bold text-black' style={{ fontFamily: "'Barriecito', cursive" }}>Poems</h1>
            </div>
           
          </div>
        </main>
      </div>

    </section>
  )
}

export default HeroSection;