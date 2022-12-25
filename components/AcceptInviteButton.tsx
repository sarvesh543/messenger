"use client";

function AcceptInviteButton({
  className,
  notificationId,
  link,
  text
}: {
  className: string;
  notificationId: string;
  link: string;
  text: string;
}) {
  const handleClick = async () => {
    try {
      console.log("button clicked");
      const res = await fetch(link, {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <button className={className} onClick={handleClick}>
      {text}
    </button>
  );
}

export default AcceptInviteButton;
