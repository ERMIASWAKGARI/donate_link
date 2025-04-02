const TopNav = () => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button className="md:hidden mr-4">
          <span className="material-icons">menu</span>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <span className="material-icons">notifications</span>
        </button>
        <div className="flex items-center">
          <img
            src="/path/to/profile.jpg"
            alt="Admin"
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-sm font-medium">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
