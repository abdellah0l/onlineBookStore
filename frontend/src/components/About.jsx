import Navigation from "./navigation";

export default function About() {

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        fontFamily: "'Caveat', cursive",
        overflow: "hidden",
        backgroundImage: 'url("/happy-cutout3.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navigation />
      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100vw",
          maxWidth: "100vw",
          padding: "0 4vw",
          gap: 32,
        }}
      >
        {/* Left - Title */}
        <div
          style={{
            width: "40%",
            minWidth: 200,
            maxWidth: 340,
            fontSize: "60px",
            marginRight: "200px",
            fontWeight: "normal",
            color: "saddlebrown",
            textAlign: "left",
            fontFamily: "'Caveat', cursive",
            lineHeight: "0.7",
            marginBottom: 0,
            flex: "0 0 200px",
            userSelect: "none",
          }}
        >
          <img
            src="/stack-of-books.png"
            alt="Stack of Books"
            style={{
              width: "350px",
              height: "300px",
              maxWidth: 300,
              marginBottom: 16,
            }}
          ></img>
        </div>

        {/* Right - Text */}
        <div
          style={{
            width: "60%",
            minWidth: 220,
            maxWidth: 520,
            fontSize: "22px",
            lineHeight: "1.5",
            color: "#222",
            flex: "1 1 300px",
            borderRadius: 12,
            padding: "24px 28px",
            boxSizing: "border-box",
          }}
        >
          <p style={{ marginTop: "18px" }}>
            We built this online bookstore to make discovering, buying, and
            reading books simple and enjoyable. From curated collections to fast
            checkout and secure reading access, every detail is focused on a
            smooth reading experience for our community.
          </p>
          <p style={{ marginTop: "18px" }}>
            Our mission is to connect readers with stories and knowledge they
            love. Browse new releases, explore genres, and save favorites to
            your wishlist as you build your personal library.
          </p>
        </div>
      </div>
    </div>
  );
}
