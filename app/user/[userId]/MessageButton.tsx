"use client";

function MessageButton({
  className,
  friendId,
}: {
  className: string;
  friendId: string;
}) {
  const handleClick = async () => {
    try {
      const res = await fetch("/api/user/sendInvite", {
        method: "POST",
        body: JSON.stringify({ friendId }),
      });
      const data = await res.json();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <button className={className} onClick={handleClick}>
      Message <img src="/chat.png" alt="chat message icon" />
    </button>
  );
}

export default MessageButton;
