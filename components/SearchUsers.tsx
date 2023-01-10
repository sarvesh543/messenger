"use client";
import { useRouter } from "next/navigation";
import React, {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import "../styles/loadings.css";

function debounce(func: Function, timeout = 300) {
  let timer: any;

  return function (this: any, ...args: any[]) {
    const signal = new AbortController();

    clearTimeout(timer);
    timer = setTimeout(() => {
      func(signal, ...args);
    }, timeout);

    return signal;
  };
}

const getResults = debounce(
  async (
    signal: AbortController,
    searchTerm: string,
    pageNum: number,
    setResult: Function,
    setLoad: Function,
    setHasMore: Function
  ) => {
    setLoad(true);
    if (searchTerm === "") {
      setResult([]);
      setLoad(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/searchUser?q=${searchTerm}&page=${pageNum}`,
        {
          signal: signal.signal,
        }
      );
      const data = await res.json();
      if (res.ok) {
        setResult((prev: any[]) => [...prev, ...data]);
        if (data.length === 0) setHasMore(false);
        setLoad(false);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        // abort error is expected
      }
    }
    // return abort fetch handler
  }
);

const useSearch = (
  search: string,
  searchResults: any[],
  setSearchResults: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setHasMore(true);
    setLoading(true);
    setSearchResults([]);
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!hasMore && searchResults.length > 0) {
      setTimeout(() => setLoading(false), 1000);
      return;
    }
    const signal = getResults(
      search,
      page,
      setSearchResults,
      setLoading,
      setHasMore
    );
    return () => {
      // abort fetch handler
      signal.abort();
    };
  }, [page, search]);

  return { setPage, loading };
};

type Props = {
  setSearchResults: React.Dispatch<React.SetStateAction<any[]>>;
  searchResults: any[];
  children: React.ReactNode;
  lastRef: MutableRefObject<null>;
  styles: any
};

function SearchUsers({searchResults, setSearchResults, children, lastRef, styles}:Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { setPage, loading } = useSearch(search, searchResults, setSearchResults);
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };


  

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
        // console.log("last element reached");
      }
    });

    const currentRef = lastRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [searchResults]);
  return (
    <>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        className={styles.searchInput}
        placeholder="Search for users..."
      />
      <div className={styles.searchResults}>
        {searchResults.length === 0 && loading && (
          // <div className="loaderContainer" style={{margin:"98px"}}>
          <div className="loader" style={{ margin: "auto" }}></div>
          // </div>
        )}
        {searchResults.length === 0 && !loading && (
          <h1 style={{ margin: "auto" }}>No Matches</h1>
        )}
        {searchResults.length !== 0 && (
          <>
            {children}
            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "15px",
                }}
              >
                <div className={`loader ${styles.spinner}`}></div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SearchUsers;
