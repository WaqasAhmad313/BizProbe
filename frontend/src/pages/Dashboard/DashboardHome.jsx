const DashboardHome = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome to BizProbe!
      </h2>
      <p className="text-gray-600">
        Use the sidebar to navigate between your businesses, outreach,
        follow-ups, and templates.
      </p>

      {/* Placeholder for future dashboard widgets or stats */}
      <div className="mt-6">
        <div className="p-4 bg-white rounded-2xl shadow-sm border text-sm text-gray-500">
          Dashboard overview widgets will go here.
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
