import { useState, useEffect } from "react";

export function useJobs(query) {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(
    function () {
      /* because the API even give response if there is no query, so i want to clean the UI if there is no 
      query*/
      if (query === "") setJobs([]);
      if (query.length <= 2) return;

      const controller = new AbortController();

      async function getJobData() {
        setError("");
        setLoading(true);

        try {
          const res = await fetch(
            `https://remotive.com/api/remote-jobs?search=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) {
            throw new Error(`Couldn't connect to network!`);
          }
          const data = await res.json();

          if (data.jobs.length === 0) {
            throw new Error(
              `No jobs found for ${query}, please try a different keyword `
            );
          }

          setJobs(data.jobs);

          setLoading(false);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            setJobs([]);
          }
        } finally {
          setLoading(false);
        }
      }

      getJobData();

      return () => {
        controller.abort();
      };
    },
    [query]
  );

  return { jobs, error, loading };
}
