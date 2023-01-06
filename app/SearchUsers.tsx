"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "../styles/Home.module.css";
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

const useSearch = (search: string) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
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

  return { setPage, loading, searchResults };
};

function SearchUsers() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { setPage, loading, searchResults } = useSearch(search);
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  // navigate to user profile
  const handleUserClick = (id: string) => {
    router.push(`/user/${id}`);
  };

  //   intersection
  const lastRef = useRef(null);

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
            {searchResults.map((user: any, index) => {
              return (
                <div
                  key={user._id}
                  ref={index === searchResults.length - 1 ? lastRef : null}
                  className={styles.userItem}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className={styles.userImageAndName}>
                    <Image
                      className={styles.userImage}
                      src={user.image}
                      alt="chat image"
                      width={32}
                      height={32}
                    />

                    <h2 className={styles.userName}>{user.name}</h2>
                  </div>
                </div>
              );
            })}
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
