document.addEventListener("DOMContentLoaded", () => {
  const artPiece = document.getElementById("art-piece");

  artPiece.addEventListener("mouseover", () => {
    artPiece.style.border = "2px solid red";
  });

  artPiece.addEventListener("mouseout", () => {
    artPiece.style.border = "none";
  });
});
