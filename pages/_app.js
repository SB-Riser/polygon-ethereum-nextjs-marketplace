import '../styles/globals.css'
import Link from 'next/link'

function Marketplace({ Component, pageProps }) {
  return (
    <div>
    <nav className='bg-white-100'>
        <div className='max-w-7xl mx-auto border-b'>
          <div className='flex justify-between py-5'>
            <div className='flex space-x-4'>
              <div>
                <p className="mt-3 mr-4 mb-3 text-4xl text-green-400 font-bold">NFT Marketplace</p>
              </div>
              <div className='hidden md:flex items-center py-4 px-3'>
                <Link href="/">
                  <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                    Home
                  </a>
                </Link>

                <Link href="/create-item">
                  <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                    Sell Digital Asset
                  </a>
                </Link>

                <Link href="/my-assets">
                  <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                    My Digital Assets
                  </a>
                </Link>

                <Link href="/creator-dashboard">
                  <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                    Creator Dashboard
                  </a>
                </Link>

                <Link href="/auctions">
                  <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                    Auctions
                  </a>
                </Link>
              </div>
            </div>
            <div className='hidden md:flex items-center space-x-2'>
              <a className='py-2 px-3 text-gray-700 hover:text-gray-900' href='#'>
                Login
              </a>
              <a className='py-2 px-3  bg-green-400 text-white rounded hover:text-gray-500 hover:bg-green-300' href='#'>
                Sign Up
              </a> 
            </div>

            {/* mobile button goes here */}
            <div className='md:hidden flex items-center'>
              <button
                className='mobile-menu-button'
                onClick={
                  () => {
                      const btn = document.querySelector("button.mobile-menu-button");
                      const menu = document.querySelector(".mobile-menu");

                      btn.addEventListener("click", () => {
                        menu.classList.toggle("hidden");
                      });
                  }
                }
              >
                <svg className='w-6 h-6' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        <div className='hidden mobile-menu'>
          <div className='block py-2 px-4 text-sm hover:bg-gray-100'>
            <Link href="/">
              <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                Home
              </a>
            </Link>

            <Link href="/create-item">
              <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                Sell Digital Asset
              </a>
            </Link>

            <Link href="/my-assets">
              <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                My Digital Assets
              </a>
            </Link>

            <Link href="/creator-dashboard">
              <a className="transition duration-300 text-center block border border-white rounded hover:border-gray-200 text-green-500 hover:bg-gray-200 py-2 px-4 text-1xl mr-6">
                Creator Dashboard
              </a>
            </Link>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </div >
  )
}

export default Marketplace