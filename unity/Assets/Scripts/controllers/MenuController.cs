using controllers;
using models;
using UnityEngine;
using UnityEngine.UI;

public class MenuController : MonoBehaviour
{
    private static GameObject _instance = null;
    
    private GameController _gameController;
    private GameObject _mainMenuGameObject;
    private GameObject _newGroupMenuGameObject;
    private NewGroupMenuController _newGroupMenuController;
    private GameObject _joinGroupMenuGameObject;
    private JoinGroupMenuController _joinGroupMenuController;
    private GameObject _choosePostureMenuGameObject;
    private ChoosePostureMenuController _choosePostureMenuController;
    private GameObject _waitForOtherParticipantsMenuGameObject;
    private WaitForOtherParticipantsMenuController _waitForOtherParticipantsMenuController;
    private GameObject _activeSessionMenuGameObject;
    private GameObject _errorMessageGameObject;
    private ErrorMessageController _errorMessageController;

    private string _groupName;

    private void Awake()
    {
        // Make object singleton
        if (_instance is null)
        {
            _instance = gameObject;
        }
        else
        {
            Destroy(gameObject);
        }
        
        // Keep object when switching to another scene
        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        GameObject gameControllerGameObject = GameObject.Find("GameController");
        _gameController = gameControllerGameObject.GetComponent<GameController>();
        
        _mainMenuGameObject = gameObject.transform.Find("MainMenu").gameObject;
        
        _newGroupMenuGameObject = gameObject.transform.Find("NewGroupMenu").gameObject;
        _newGroupMenuController = _newGroupMenuGameObject.GetComponent<NewGroupMenuController>();
        
        _joinGroupMenuGameObject = gameObject.transform.Find("JoinGroupMenu").gameObject;
        _joinGroupMenuController = _joinGroupMenuGameObject.GetComponent<JoinGroupMenuController>();

        _choosePostureMenuGameObject = gameObject.transform.Find("ChoosePostureMenu").gameObject;
        _choosePostureMenuController = _choosePostureMenuGameObject.GetComponent<ChoosePostureMenuController>();
        
        _waitForOtherParticipantsMenuGameObject = gameObject.transform.Find("WaitForOtherParticipantsMenu").gameObject;
        _waitForOtherParticipantsMenuController = _waitForOtherParticipantsMenuGameObject.GetComponent<WaitForOtherParticipantsMenuController>();
        _waitForOtherParticipantsMenuController.StartOnInactive();
        
        _activeSessionMenuGameObject = gameObject.transform.Find("ActiveSessionMenu").gameObject;
        
        _errorMessageGameObject = gameObject.transform.Find("ErrorMessage").gameObject;
        _errorMessageController = _errorMessageGameObject.GetComponent<ErrorMessageController>();
        _errorMessageController.StartOnInactive();
    }

    public void OnGroupCreated()
    {
        _newGroupMenuController.Clear();
        _newGroupMenuGameObject.SetActive(false);
        _choosePostureMenuGameObject.SetActive(true);
    }
    
    public void OnGroupFound()
    {
        _joinGroupMenuController.Clear();
        _joinGroupMenuGameObject.SetActive(false);
        _choosePostureMenuGameObject.SetActive(true);
    }

    public void OnGroupJoined(MeditationGroup group, int placeId)
    {
        _choosePostureMenuController.Reset();
        _choosePostureMenuGameObject.SetActive(false);
        _waitForOtherParticipantsMenuGameObject.SetActive(true);
        _waitForOtherParticipantsMenuController.InitParticipantEntries(group, placeId);
    }
    
    public void OnParticipantJoined(Participant participant)
    {
        _waitForOtherParticipantsMenuController.AddParticipantEntry(participant);
    }
    
    public void OnParticipantLeft(int placeId)
    {
        _waitForOtherParticipantsMenuController.RemoveParticipantEntry(placeId);
        
    }
    
    public void OnGroupStarted()
    {
        _waitForOtherParticipantsMenuController.Clear();
        _waitForOtherParticipantsMenuGameObject.SetActive(false);
        _activeSessionMenuGameObject.SetActive(true);
    }
    
    public void OnGroupLeft(bool groupWasStarted)
    {
        if (groupWasStarted)
        {
            _activeSessionMenuGameObject.SetActive(false);
        }
        else
        {
            _waitForOtherParticipantsMenuController.Clear();
            _waitForOtherParticipantsMenuGameObject.SetActive(false);
        }
        
        _mainMenuGameObject.SetActive(true);
    }

    public void ShowErrorMessage(string message)
    {
        _errorMessageController.SetMessage(message);
        _errorMessageGameObject.SetActive(true);
    }
    
    public void QuitApplication()
    {
        Debug.Log("Quit Application");
        Application.Quit();
    }
}
