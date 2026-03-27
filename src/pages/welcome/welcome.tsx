import backgroundImage from "./../../assets/backgroundImage.jpg";
import { useNavigate } from 'react-router-dom';

function Welcome() {
    const navigate = useNavigate();

    const handleClick = () =>{
        navigate('/allBlogs');
    }
  return (
    <div className='welcome-container h-screen bg-cover bg-center flex items-center justify-center' style={{backgroundImage: `url(${backgroundImage})`}}>
      <div className="flex flex-col items-center gap-4">
  <p className="text-black text-[96px]" style={{ fontFamily: "'Babylonica', cursive" }}>
    Gallery of words
  </p>
  <button
    className="px-6 py-2 bg-[#291200] text-white text-lg transition duration-300 rounded-sm cursor-pointer hover:bg-amber-600"
    style={{ fontFamily: 'Georgia, serif' }}
    onClick={handleClick}
  >
    Poems
  </button>
</div>

    </div>
  )
}

export default Welcome