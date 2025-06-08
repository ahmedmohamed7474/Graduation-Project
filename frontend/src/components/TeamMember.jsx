import PropTypes from "prop-types";

const TeamMember = ({ name, role, roleDescription, linkedIn, image }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-blue-50">
        <img
          src={image || "https://via.placeholder.com/150"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-blue-600 font-medium mb-3">{role}</p>
      <p className="text-sm text-gray-600 mb-6 line-clamp-3 hover:line-clamp-none transition-all duration-300">
        {roleDescription}
      </p>
      {linkedIn && (
        <a
          href={linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          <span className="font-medium">Connect on LinkedIn</span>
        </a>
      )}
    </div>
  );
};

TeamMember.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  roleDescription: PropTypes.string.isRequired,
  linkedIn: PropTypes.string,
  image: PropTypes.string,
};

export default TeamMember;
