using System.Collections.Generic;
using System.Linq;
using models;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace controllers
{
    public class WaitForOtherParticipantsMenuController : MonoBehaviour
    {
        private NetworkController _networkController;
        
        // Resources
        private GameObject _participantEntryPrefab;
        private GameObject _participantLeadEntryPrefab;
        private GameObject _participantEmptyEntryPrefab;
        private Sprite _lotusPostureSprite;
        private Sprite _seizaPostureSprite;
        private Sprite _chairPostureSprite;
        
        // Input controls
        private TMP_InputField _groupInputField;
        private Button _nextButton;
        private Transform _participantWrapperTransform;
        private GameObject _leaveGroupButtonGameObject;
        private GameObject _leaveGroupLeadButtonGameObject;
        private GameObject _startGroupButtonGameObject;
        private TMP_Text _headlineText;
        private TMP_Text _groupSettingsText;

        private List<Participant> _participants;
        private int _ownPlaceId;
        

        public void StartOnInactive()
        {
            GameObject networkControllerGameObject = GameObject.Find("NetworkController");
            _networkController = networkControllerGameObject.GetComponent<NetworkController>();

            // Load resources
            _participantEntryPrefab = Resources.Load<GameObject>("Prefabs/ParticipantEntry");
            _participantLeadEntryPrefab = Resources.Load<GameObject>("Prefabs/ParticipantLeadEntry");
            _participantEmptyEntryPrefab = Resources.Load<GameObject>("Prefabs/ParticipantEmptyEntry");
            _lotusPostureSprite = Resources.Load<Sprite>("Sprites/lotus");
            _seizaPostureSprite = Resources.Load<Sprite>("Sprites/seiza");
            _chairPostureSprite = Resources.Load<Sprite>("Sprites/chair");

            // Get Objects
            _participantWrapperTransform = gameObject.transform.Find("Participants");
            _leaveGroupButtonGameObject = gameObject.transform.Find("LeaveGroupButton").gameObject;
            _leaveGroupLeadButtonGameObject = gameObject.transform.Find("LeaveGroupLeadButton").gameObject;
            _startGroupButtonGameObject = gameObject.transform.Find("StartGroupButton").gameObject;
            _headlineText = gameObject.transform.Find("Headline").gameObject.GetComponent<TMP_Text>();
            _groupSettingsText = gameObject.transform.Find("GroupSettingsText").gameObject.GetComponent<TMP_Text>();
        }
        
        public void InitParticipantEntries(MeditationGroup group, int placeId)
        {
            _participants = group.Participants;
            _ownPlaceId = placeId;
            _headlineText.text = group.Name;
            _groupSettingsText.text = $"Dauer: {group.Duration} Minuten";
            RenderParticipantEntries();
        }

        public void AddParticipantEntry(Participant participant)
        {
            _participants.Add(participant);
            RenderParticipantEntries();
        }
        
        public void RemoveParticipantEntry(int placeId)
        {
            _participants = _participants.Where(participant => participant.PlaceId != placeId).ToList();
            RenderParticipantEntries();
        }

        private void ShowGroupLeaderButtons(bool show)
        {
            _leaveGroupButtonGameObject.SetActive(!show);
            _leaveGroupLeadButtonGameObject.SetActive(show);
            _startGroupButtonGameObject.SetActive(show);
        }

        private void ClearParticipantEntries()
        {
            foreach (Transform participantEntry in _participantWrapperTransform)
            {
                GameObject.Destroy(participantEntry.gameObject);
            }
        }
        
        private void RenderParticipantEntries()
        {
            ClearParticipantEntries();

            // Add participant entries
            for (int i = 0; i < _participants.Count; i++)
            {
                RenderParticipantEntry(i, _participants[i], i == 0, i == _ownPlaceId);
            }

            // Add empty entries
            for (int i = _participants.Count; i < 6; i++)
            {
                RenderParticipantEntry(i);
            }
            
            ShowGroupLeaderButtons(_ownPlaceId == _participants.First().PlaceId);
        }

        private void RenderParticipantEntry(int index, Participant participant = null, bool isGroupLeader = false, bool isCurrent = false)
        {
            GameObject participantEntry;
            if (participant == null)
            {
                participantEntry = GameObject.Instantiate(_participantEmptyEntryPrefab, _participantWrapperTransform);

            }
            else
            {
                participantEntry = GameObject.Instantiate(isGroupLeader ? _participantLeadEntryPrefab : _participantEntryPrefab, _participantWrapperTransform);
                participantEntry.transform.Find("Nickname").gameObject.GetComponent<TMP_Text>().text = participant.Nickname;
                
                participantEntry.transform.Find("PostureIconWrapper").Find("PostureIcon").GetComponent<Image>().sprite = SpriteFromPosture(participant.Posture);
                
                if (isCurrent)
                {
                    participantEntry.transform.Find("Current").gameObject.SetActive(true);
                }
            }

            RectTransform rectTransform = participantEntry.GetComponent<RectTransform>();
            rectTransform.pivot = new Vector2(0, 1);
            rectTransform.anchorMin = new Vector2(0, 1);
            rectTransform.anchorMax = new Vector2(0, 1);
            participantEntry.GetComponent<RectTransform>().anchoredPosition = new Vector3((index % 2 == 0) ? 0f : 380f, (index / 2) * -90);
        }

        public void Clear()
        {
            ClearParticipantEntries();
        }
        
        public void LeaveGroup()
        {
            _networkController.LeaveGroup();
        }
        
        public void StartGroup()
        {
            _networkController.StartGroup();
        }

        private Sprite SpriteFromPosture(Posture posture)
        {
            switch (posture)
            {
                case Posture.QuarterLotus:
                    return _lotusPostureSprite;
                
                case Posture.Chair:
                    return _chairPostureSprite;

                default:
                    return _seizaPostureSprite;
            }
        }
    }
}
