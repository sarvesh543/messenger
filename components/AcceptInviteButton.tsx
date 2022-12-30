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
  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };
  const handleClick = async () => {
    try {
      const res = await fetch(link, {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });
      reloadSession();
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
