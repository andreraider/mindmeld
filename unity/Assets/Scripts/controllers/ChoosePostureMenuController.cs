using models;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace controllers
{
    public class ChoosePostureMenuController : MonoBehaviour
    {
        private NetworkController _networkController;
        private GameController _gameController;
        
        // Input controls
        private TMP_InputField _nicknameInputField;
        private TMP_Dropdown _postureDropdown;
        private Button _nextButton;
        
        // Input values
        private string _groupName;

        private void Start()
        {
            GameObject networkControllerGameObject = GameObject.Find("NetworkController");
            _networkController = networkControllerGameObject.GetComponent<NetworkController>();
            
            GameObject gameControllerGameObject = GameObject.Find("GameController");
            _gameController = gameControllerGameObject.GetComponent<GameController>();
            
            GameObject nicknameInputFieldGameObject = gameObject.transform.Find("NicknameInputField").gameObject;
            _nicknameInputField = nicknameInputFieldGameObject.GetComponent<TMP_InputField>();
            
            GameObject postureDropdownGameObject = gameObject.transform.Find("PostureDropdown").gameObject;
            _postureDropdown = postureDropdownGameObject.GetComponent<TMP_Dropdown>();

            GameObject nextButtonGameObject = gameObject.transform.Find("NextButton").gameObject;
            _nextButton = nextButtonGameObject.GetComponent<Button>();
            
            Validate();
        }

        public void Validate()
        {
            _nextButton.interactable = !string.IsNullOrEmpty(_nicknameInputField.text);
        }

        public void Reset()
        {
            _nicknameInputField.text = "";
            _postureDropdown.value = 0;
        }

        public void JoinGroup()
        {
            Participant participant = new Participant(_nicknameInputField.text, SelectedPostureType());
            _networkController.JoinGroup(_gameController.Group.Name, participant);
        }

        public void RemoveGroupIfEmpty()
        {
            _networkController.RemoveGroupIfEmpty(_gameController.Group.Name);
        }

        private Posture SelectedPostureType()
        {
            switch (_postureDropdown.value)
            {
                case 0:
                    return Posture.QuarterLotus;
               
                case 2:
                    return Posture.Chair;

                default:
                    return Posture.Seiza;
            }
        }
    }
}
