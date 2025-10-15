export default function PathCard({ path, index }) {
  return (
    <div className="bg-white  border-l-4 shadow-lg border-sky-600 p-10">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
      <div className="text-sm text-gray-600 mb-4">
        Level: {path.level} • Duration: {path.duration_weeks} weeks
      </div>

      <div className="space-y-4">
        {path.steps?.map((step, stepIndex) => (
          <div key={stepIndex} className="border-l-2 border-blue-200 pl-4">
            <h4 className="font-semibold text-gray-800">
              {step.title}
              <span className="text-sm text-blue-600 ml-2">
                ({step.estimated_time_hours || "?"} hours)
              </span>
            </h4>
            <p className="text-gray-600 text-sm mt-1">{step.description}</p>

            {step.resources?.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Resources:</p>
                <ul className="text-sm text-blue-600 mt-1 space-y-1">
                  {step.resources.map((resource, resIndex) => (
                    <li key={resIndex}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {resource.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
