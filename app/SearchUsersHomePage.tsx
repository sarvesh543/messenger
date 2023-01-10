"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react"
import SearchUsers from "../components/SearchUsers";
import styles from "../styles/Home.module.css";


function SearchUsersHomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();
  //   intersection
  const lastRef = useRef(null);

  // navigate to user profile
  const handleUserClick = (id: string) => {
    router.push(`/user/${id}`);
  };

  return (
    <SearchUsers
      searchResults={searchResults}
      setSearchResults={setSearchResults}
      lastRef={lastRef}
      styles={styles}
    >
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
                priority
              />

              <h2 className={styles.userName}>{user.name}</h2>
            </div>
          </div>
        );
      })}
    </SearchUsers>
  );
}

export default SearchUsersHomePage