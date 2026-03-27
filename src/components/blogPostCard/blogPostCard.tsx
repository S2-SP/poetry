import { useContext } from 'react';
import { Button } from '@material-tailwind/react';
import myContext from '../../context/data/myContext';

interface PoemData {
  date: string;
  title : string;
  description : string;
}

function BlogPostCard() {

  const context = useContext(myContext);
  const {mode} = context;
  
  const poems : PoemData[] = [
    {
      date : "20 Jul 2025",
      title : "This Poem 1",
      description : "desctiption one"
    },
    {
      date : "21 Jul 2025",
      title : "This Poem 2",
      description : "desctiption two"
    },
]


return (
    <section className="text-gray-600 body-font">
      {/* Wrapper for side-by-side layout */}
      <div className="container px-5 py-10 mx-auto">
        <div className="flex flex-wrap justify-center -m-4">
          {poems.map((poem, index) => (
            <div key={index} className="p-4 md:w-1/3">
              <div
                style={{
                  background: mode === 'dark' ? 'rgb(30, 41, 59)' : 'white',
                  borderBottom:
                    mode === 'dark'
                      ? '4px solid rgb(226, 232, 240)'
                      : '4px solid rgb(30, 41, 59)'
                }}
                className={`h-full shadow-lg hover:-translate-y-1 cursor-pointer hover:shadow-gray-400 ${
                  mode === 'dark' ? 'shadow-gray-700' : 'shadow-xl'
                } rounded-xl overflow-hidden`}
              >
                <div className="p-6">
                  <h2
                    className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1"
                    style={{
                      color:
                        mode === 'dark'
                          ? 'rgb(226, 232, 240)'
                          : 'rgb(30, 41, 59)'
                    }}
                  >
                    {poem.date}
                  </h2>
                  <h1
                    className="title-font text-lg font-bold text-gray-900 mb-3"
                    style={{
                      color:
                        mode === 'dark'
                          ? 'rgb(226, 232, 240)'
                          : 'rgb(30, 41, 59)'
                    }}
                  >
                    {poem.title}
                  </h1>
                  <p
                    className="leading-relaxed mb-3"
                    style={{
                      color:
                        mode === 'dark'
                          ? 'rgb(226, 232, 240)'
                          : 'rgb(30, 41, 59)'
                    }}
                  >
                    {poem.description}
                  </p>
                  <Button
                    style={{
                      background:
                        mode === 'dark'
                          ? 'rgb(226, 232, 240)'
                          : 'rgb(30, 41, 59)',
                      color:
                        mode === 'dark'
                          ? 'rgb(30, 41, 59)'
                          : 'rgb(226, 232, 240)'
                    }}
                    placeholder={undefined}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  >
                    See More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogPostCard