async function loadRoundBoard() {

  if (roundBoardState.loading) {
    return;
  }

  const message =
    document.getElementById(
      "roundBoardMessage"
    );

  /*
   * The main LMS app has already authenticated
   * the player before the Round Board is opened.
   *
   * Do NOT wait on lmsAuthReady here.
   */

  const playerCode =
    (
      localStorage.getItem(
        "lms_player_code"
      ) || ""
    )
      .trim()
      .toUpperCase();

  if (!playerCode) {

    if (message) {

      message.innerHTML = `
        <div class="round-board-error">

          Player login could not be found.

          <br><br>

          Please return to Home and reopen
          Round Board.

        </div>
      `;

    }

    return;
  }

  roundBoardState.loading =
    true;

  if (message) {

    message.textContent =
      "Loading round...";

  }

  try {

    /*
     * Use the authenticated Supabase
     * session already used by the app.
     */

    const playerData =
      await roundBoardRpc(
        "get_lms_player_data",
        {
          p_player_code:
            playerCode
        }
      );


    if (!playerData?.success) {

      throw new Error(
        playerData?.message ||
        "Player data could not be loaded."
      );

    }


    const round =
      playerData.current_round;


    if (!round?.id) {

      if (message) {

        message.innerHTML = `

          <strong>
            No active round
          </strong>

          <br><br>

          There is currently no
          active Last Man Standing
          round.

        `;

      }

      return;

    }


    /*
     * Get the Round Board for the
     * player's current round.
     */

    const boardData =
      await roundBoardRpc(
        "get_lms_round_board",
        {
          p_round_id:
            round.id
        }
      );


    if (!boardData?.success) {

      throw new Error(
        boardData?.message ||
        "Round board could not be loaded."
      );

    }


    roundBoardState.roundId =
      round.id;


    roundBoardState.data =
      boardData;


    renderRoundBoard();

  }

  catch (error) {

    console.error(
      "Round Board error:",
      error
    );


    if (message) {

      message.innerHTML = `

        <div
          class="round-board-error"
        >

          <strong>
            Round Board could not be loaded
          </strong>

          <br><br>

          ${roundBoardEsc(
            error?.message ||
            "Please try again."
          )}

        </div>

      `;

    }

  }

  finally {

    roundBoardState.loading =
      false;

  }

}
