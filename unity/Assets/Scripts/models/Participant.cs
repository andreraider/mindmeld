namespace models
{
    public class Participant
    {
        public readonly string Nickname;
        public readonly Posture Posture;
        public readonly int PlaceId;

        public Participant(string nickname, Posture posture, int placeId = -1)
        {
            Nickname = nickname;
            Posture = posture;
            PlaceId = placeId;
        }
    }
}