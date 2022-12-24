"use client";

function AcceptInviteButton({
  className,
  notificationId,
}: {
  className: string;
  notificationId: string;
}) {
  const handleClick = async () => {
    try {
      console.log("button clicked");
      const res = await fetch("/api/user/acceptInvite", {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <button className={className} onClick={handleClick}>
      Accept
    </button>
  );
}

export default AcceptInviteButton;
