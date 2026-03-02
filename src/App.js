import { useRef, useState } from "react";
import LoaderSVG from "./Loader";
import DOMPurify from "dompurify";
import { useKey } from "./hooks/useKey";
import { useJobs } from "./hooks/useJobs";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

export default function App() {
  return <JobSearchDashboard />;
}

function JobSearchDashboard() {
  const [query, setQuery] = useState("");

  const { jobs, error, loading } = useJobs(query);

  const [selectedId, setSelectedId] = useState(null);

  const [savedJobs, setSavedJobs] = useLocalStorageState("savedJobs", []);

  function handleSelectJob(jobObj) {
    setSelectedId((prevSelectedId) =>
      prevSelectedId === jobObj.id ? null : jobObj.id
    );
  }

  function handleCloseJob() {
    setSelectedId(null);
  }

  function handleSaveJob(job) {
    setSavedJobs((prevJob) => [...prevJob, job]);
    handleCloseJob();
  }

  function handleDeleteSavedJob(id) {
    setSavedJobs((prevSaveJobs) =>
      prevSaveJobs.filter((saveJob) => saveJob.id !== id)
    );
  }

  return (
    <div className="bg-blue-100 p-4 border-2 height-full font-sans  ">
      <Nav>
        <Search query={query} setQuery={setQuery} />
        <NumResults resultsCount={jobs.length} />
      </Nav>

      <div className="flex flex-col  items-center  md:flex-row md:justify-around mt-7">
        <Box>
          {loading && <Loader />}
          {error && (
            <ErrorMessage
              message={error}
              appearance="text-red-600 shadow-lg font-semibold p-4 "
            />
          )}

          {!error && !loading && jobs.length > 0 && (
            <JobList
              selectedId={selectedId}
              onSelectJob={handleSelectJob}
              jobs={jobs}
            />
          )}

          {/* on initial mount show this message*/}
          {!error && !loading && query === "" && jobs.length === 0 && (
            <ErrorMessage
              message="Search for your desired jobs to get hire"
              appearance="text-blue-600 shadow-lg font-semibold p-4"
            />
          )}
        </Box>
        <Box>
          <SavedJobs savedJobs={savedJobs} onDeleteJob={handleDeleteSavedJob} />
          {selectedId && (
            <JobDetails
              selectedJob={jobs.find((job) => job.id === selectedId)}
              onCloseJob={handleCloseJob}
              savedJobs={savedJobs}
              OnSave={handleSaveJob}
            />
          )}
        </Box>
      </div>
    </div>
  );
}
//
function Nav({ children }) {
  return (
    <nav className="flex flex-col items-center   md:flex-row  md:justify-between md:items-center bg-blue-100 min-h-14 border-2 border-blue-300 rounded-lg shadow-xl p-3  ">
      <h1
        className="font-bold text-lg self-start md:text-2xl   "
        style={{ color: "#0f172a" }}
      >
        Job Search Dashboard
      </h1>
      {children}
    </nav>
  );
}

function Search({ query, setQuery }) {
  const InputEl = useRef(null);

  useKey(
    "Enter",
    function () {
      if (document.activeElement === InputEl.current) return;
      InputEl.current.focus();
      setQuery("");
    },
    InputEl.current
  );

  return (
    <input
      type="text"
      className="rounded-2xl max-w-100 w-full  md:w-96  focus:outline-none mt-1 pl-1 py-2 "
      placeholder="Search your desired job here"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={InputEl}
    />
  );
}

function NumResults({ resultsCount }) {
  return (
    <div className="num-results mt-1   self-end  md:mb-2 ">
      <p style={{ color: "#0f172a" }}>
        Found <strong>{resultsCount}</strong> Jobs
      </p>
    </div>
  );
}

function JobList({ jobs, onSelectJob, selectedId }) {
  return (
    <ul className="p-1 pt-3  ">
      {jobs.map((job) => (
        <JobItem
          jobObj={job}
          key={job.id}
          onSelectJob={onSelectJob}
          selectedId={selectedId}
        />
      ))}
    </ul>
  );
}

function JobItem({ jobObj, onSelectJob, selectedId }) {
  const isActive = jobObj.id === selectedId;

  return (
    <li
      onClick={() => onSelectJob(jobObj)}
      className={` ${
        isActive && "bg-blue-400"
      } grid grid-rows-4 md:grid-rows-none gap-x-5 md:gap-3   md:grid-cols-3   bg-blue-200 md:mb-1 mb-4 rounded-2xl p-1 md:rounded-none md:p-2 hover:bg-blue-300 cursor-pointer `}
    >
      <h3 className=" text-sm  flex items-start md:col-span-3 break-words   ">
        <span className="text-blue-600 text-sm">👤</span>{" "}
        <span className="font-bold ml-1 " style={{ color: "#0f172a" }}>
          {jobObj.title}
        </span>
      </h3>

      <span className=" flex justify-start items-start  ">
        <span className=" text-sm">🏠</span>
        <span className="text-sm ml-1" style={{ color: "#475569" }}>
          {jobObj.company_name}
        </span>
      </span>

      <span className=" flex justify-start items-start text-sm ">
        <span>📍</span>
        <span className="text-sm ml-1" style={{ color: "#475569" }}>
          {jobObj.candidate_required_location}
        </span>
      </span>

      <span className=" flex justify-start items-start  ">
        <span className="text-sm">💼</span>
        <span style={{ color: "#475569" }}>
          {jobObj.job_type.includes("_")
            ? `${jobObj.job_type.split("_").at(0)} ${jobObj.job_type
                .split("_")
                .at(1)}`
            : jobObj.job_type}
        </span>
      </span>
    </li>
  );
}

function SavedJobs({ savedJobs, onDeleteJob }) {
  return (
    <ul>
      <h2 className=" text-center font-bold text-2xl  border border-blue-300 border-b-4">
        Saved Jobs
      </h2>

      {savedJobs.length === 0 ? (
        <ErrorMessage
          message="No Jobs have been saved yet!"
          appearance="text-blue-600 shadow-md mt-4  p-2 "
        />
      ) : (
        savedJobs?.map((saved) => (
          <SavedJobsItem
            savedJobObj={saved}
            key={saved.id}
            onDeleteJob={onDeleteJob}
          />
        ))
      )}
    </ul>
  );
}

function SavedJobsItem({ savedJobObj, onDeleteJob }) {
  return (
    <li className=" grid md:grid-cols-2 bg-blue-200 mt-2  ">
      <h4 className="font-bold col-span-2">
        <span className="mr-1">👤</span>
        <span style={{ color: "#0f172a" }}>{savedJobObj.title}</span>
      </h4>

      <span>
        <span className="mr-1">🏠</span>
        <span style={{ color: "#475569" }}>{savedJobObj.company_name}</span>
      </span>

      <button
        onClick={() => onDeleteJob(savedJobObj.id)}
        className=" flex justify-center items-center col-span-2 md:col-span-1 rounded-3xl text-sm border outline-none border-blue-800 md:w-1/6 max-w-[95%] ml-2 hover:scale-110 transition-all bg-blue-300 active:bg-transparent  "
      >
        ❌
      </button>
    </li>
  );
}

function Box({ children }) {
  return <div className="box  ">{children}</div>;
}

function JobDetails({ selectedJob, onCloseJob, OnSave, savedJobs }) {
  const publishedDate = new Date(selectedJob.publication_date);

  function formatTwoDigits(value) {
    return value.toString().padStart(2, "0");
  }

  const isSaved = savedJobs.map((save) => save.id).includes(selectedJob.id);

  useKey("Escape", onCloseJob);

  return (
    <div className="job-details w-11/12 shadow-xl max-w-full  m-auto mt-4  p-2 flex  flex-col    ">
      <div className="first-row grid auto-rows-min relative  md:grid-cols-2">
        <img
          src={selectedJob.company_logo}
          className="max-w-full w-full object-cover    pr-1 rounded-lg"
          alt={selectedJob.company_name}
        />

        <span
          onClick={onCloseJob}
          className="absolute top-0 left-1  w-10 border-2 flex justify-center items-center border-blue-400 cursor-pointer rounded-full text-4xl font-extrabold "
        >
          &larr;
        </span>

        <div className="column-container grid auto-rows-min  ">
          <span>
            <strong>Title:</strong> <span>{selectedJob.title}</span>
          </span>

          <span>
            <strong>Company:</strong> <span>{selectedJob.company_name}</span>
          </span>

          <span>
            <strong>Published date:</strong>{" "}
            <span>{`${publishedDate.getFullYear()}/${formatTwoDigits(
              publishedDate.getMonth() + 1
            )}/${formatTwoDigits(publishedDate.getDate())}`}</span>
          </span>

          <span>
            <strong>Salary:</strong>{" "}
            <span>{selectedJob.salary ? selectedJob.salary : "N/A"}</span>
          </span>

          <span>
            <strong>Category:</strong> <span>{selectedJob.category}</span>
          </span>

          <span>
            <strong>Type:</strong>{" "}
            <span>
              {selectedJob.job_type.includes("_")
                ? `${selectedJob.job_type
                    .split("_")
                    .at(0)} ${selectedJob.job_type.split("_").at(1)}`
                : selectedJob.job_type}
            </span>
          </span>

          <span>
            <strong>Job URL:</strong>{" "}
            <a
              className="text-blue-600 font-medium "
              href={selectedJob.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply Now
            </a>
          </span>
        </div>
      </div>

      <div>
        <span className="font-bold ">Description:</span>
        <TextExpander
          numExpandWords={30}
          html={DOMPurify.sanitize(selectedJob.description)}
        ></TextExpander>
      </div>

      {isSaved ? (
        <p className="flex justify-center text-orange-600">
          You already saved this job
        </p>
      ) : (
        <button
          onClick={() => OnSave(selectedJob)}
          className="rounded-3xl bg-blue-400  w-1/3 h-7 mt-1 m-auto max-w-full hover:scale-110 transition-all active:bg-transparent active:border-2 active:border-blue-400 "
        >
          + Save Job
        </button>
      )}
    </div>
  );
}

function TextExpander({ html, numExpandWords = 100 }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const sanitizedHTML = DOMPurify.sanitize(html);

  const words = sanitizedHTML.split(" ");

  const displayHTML = isCollapsed
    ? words.slice(0, numExpandWords).join(" ")
    : sanitizedHTML;
  return (
    <div>
      <div
        className="job-description"
        dangerouslySetInnerHTML={{ __html: displayHTML }}
      ></div>

      {words.length > numExpandWords && (
        <button
          onClick={() => setIsCollapsed((is) => !is)}
          className="text-blue-600 underline"
        >
          {isCollapsed ? "Show More..." : "Show Less"}
        </button>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {<LoaderSVG />}
    </div>
  );
}

function ErrorMessage({ message, appearance }) {
  const style = {
    display: "flex",

    justifyContent: "center",
  };
  return (
    <p style={style} className={appearance}>
      {" "}
      {message}
    </p>
  );
}
