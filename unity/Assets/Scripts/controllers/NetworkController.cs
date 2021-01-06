using System;
using System.Collections.Generic;
using Looxid.Link;
using models;
using SocketIO;
using UnityEngine;
using UnityEngine.SceneManagement;

public class NetworkController : MonoBehaviour
{
    private static GameObject _instance = null;

    private SocketIOComponent _socket;
    private GameController _gameController;
    private MenuController _menuController;
    private LooxidLinkController _looxidLinkController;

    
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
    
    void Start()
    {
        // Get components
        GameObject gameControllerGameObject = GameObject.Find("GameController");
        _gameController = gameControllerGameObject.GetComponent<GameController>();
        
        GameObject menuControllerGameObject = GameObject.Find("Menu");
        _menuController = menuControllerGameObject.GetComponent<MenuController>();

        _looxidLinkController = GameObject.Find("LooxidLinkController").GetComponent<LooxidLinkController>();

        GameObject socketIOGameObject = GameObject.Find("SocketIO");
        _socket = socketIOGameObject.GetComponent<SocketIOComponent>();

        // Add event handler
        _socket.On("connect", OnConnect);
        _socket.On("disconnect", OnDisconnect);
        _socket.On("group-created", OnGroupCreated);
        _socket.On("group-already-exists", OnGroupAlreadyExists);
        _socket.On("group-found", OnGroupFound);
        _socket.On("group-not-found", OnGroupNotFound);
        _socket.On("already-joined-group", OnAlreadyJoinedGroup);
        _socket.On("group-is-full", OnGroupIsFull);
        _socket.On("nickname-already-exists", OnNicknameAlreadyExists);
        _socket.On("joined-group", OnJoinedGroup);
        _socket.On("left-group", OnLeftGroup);
        _socket.On("group-started", OnGroupStarted);
        _socket.On("participant-joined", OnParticipantJoined);
        _socket.On("participant-left", OnParticipantLeft);
        _socket.On("mental-states", OnMentalStates);
        _socket.On("time-over", OnTimeOver);
    }

    public void CreateGroup(MeditationGroup group)
    {
        JSONObject data = new JSONObject();
        data.AddField("groupName", group.Name);
        data.AddField("duration", group.Duration);
        _socket.Emit("create-group", data);
    }
    
    public void FindGroup(string groupName)
    {
        JSONObject data = new JSONObject();
        data.AddField("groupName", groupName);
        _socket.Emit("find-group", data);
    }

    public void JoinGroup(string groupName, Participant participant)
    {
        JSONObject data = new JSONObject();
        data.AddField("groupName", groupName);
        JSONObject participantObject = new JSONObject();
        participantObject.AddField("nickname", participant.Nickname);
        participantObject.AddField("posture", participant.Posture.ToString().ToUpper());
        data.AddField("participant", participantObject);
        _socket.Emit("join-group", data);
    }
    
    public void StartGroup()
    {
        _socket.Emit("start-group");
    }
    
    public void RemoveGroupIfEmpty(string groupName)
    {
        JSONObject data = new JSONObject();
        data.AddField("groupName", groupName);
        _socket.Emit("remove-empty-group", data);
    }
    
    public void LeaveGroup()
    {
        _socket.Emit("leave-group");
    }

    public void EmitMentalState(MentalState mentalState)
    {
        JSONObject data = new JSONObject();
        data.AddField("active", mentalState.Active);
        data.AddField("relaxation", mentalState.Relaxation);
        _socket.Emit("update-mental-state", data);
    }

    //-------------------- Message Handlers --------------------
    
    private void OnConnect(SocketIOEvent e)
    {
        Debug.Log("Socket connected.");
    }
    
    private void OnDisconnect(SocketIOEvent e)
    {
        Debug.Log("Socket disconnected.");
    }
    
    private void OnGroupCreated(SocketIOEvent e)
    {
        Debug.Log("Group created.");
        Debug.Log(e);
        _gameController.Group = MeditationGroupFromJsonObject(e.data.GetField("group"));
        _menuController.OnGroupCreated();
    }
    
    private void OnGroupAlreadyExists(SocketIOEvent e)
    {
        Debug.Log("Group already exists.");
        string groupName = e.data.GetField("groupName").str;
        _menuController.ShowErrorMessage($"Der Gruppenname \"{groupName}\" ist bereits vergeben.");
    }
    
    private void OnGroupFound(SocketIOEvent e)
    {
        Debug.Log("Group found.");
        Debug.Log(e);
        _gameController.Group = MeditationGroupFromJsonObject(e.data.GetField("group"));
        _menuController.OnGroupFound();
    }
    
    private void OnGroupNotFound(SocketIOEvent e)
    {
        Debug.Log("Group not found.");
        string groupName = e.data.GetField("groupName").str;
        _menuController.ShowErrorMessage($"Es konnte keine Gruppe mit dem Namen \"{groupName}\" gefunden werden.");
    }
    
    private void OnAlreadyJoinedGroup(SocketIOEvent e)
    {
        Debug.Log("Group already joined.");
        _menuController.ShowErrorMessage("Du bist bereits einer Gruppe beigetreten.");
    }
    
    private void OnGroupIsFull(SocketIOEvent e)
    {
        Debug.Log("Group already joined.");
        _menuController.ShowErrorMessage("Die Gruppe ist bereits voll.");
    }
    
    private void OnNicknameAlreadyExists(SocketIOEvent e)
    {
        Debug.Log("Nickname already exists.");
        _menuController.ShowErrorMessage("Eine andere Person in der Gruppe nutzt bereits den gleichen Namen.");
    }
    
    private void OnJoinedGroup(SocketIOEvent e)
    {
        Debug.Log($"Joined group \"{e.data.GetField("group").GetField("name").str}\"");
        Debug.Log(e);
        MeditationGroup group = MeditationGroupFromJsonObject(e.data.GetField("group"));
        int placeId = (int) e.data.GetField("placeId").i;
        _menuController.OnGroupJoined(group, placeId);
    }
    
    private void OnLeftGroup(SocketIOEvent e)
    {
        Debug.Log("Group left.");
        bool groupWasStarted = _gameController.Group.Started;
        if (groupWasStarted)
        {
            _gameController.OnGroupLeft();
            SceneManager.LoadScene("Scenes/Menu");
        }
  
        _menuController.OnGroupLeft(groupWasStarted);
    }
    
    private void OnGroupStarted(SocketIOEvent e)
    {
        Debug.Log("Group started.");
        Debug.Log(e);
        int placeId = (int) e.data.GetField("placeId").i;
        _gameController.Group = MeditationGroupFromJsonObject(e.data.GetField("group"));
        _gameController.OwnPlaceId = placeId;
        _menuController.OnGroupStarted();
        SceneManager.LoadScene("Scenes/SensorStatus");
    }
    
    private void OnParticipantJoined(SocketIOEvent e)
    {
        Debug.Log("Participant joined.");
        Debug.Log(e);
        Participant participant = ParticipantFromJsonObject(e.data.GetField("participant"));
        _menuController.OnParticipantJoined(participant);
    }
    
    private void OnParticipantLeft(SocketIOEvent e)
    {
        Debug.Log("Participant left.");
        Debug.Log(e);
        int placeId = (int) e.data.GetField("placeId").i;
        if (_gameController.Group.Started)
        {
            _gameController.RemoveParticipant(placeId);
        }
        else
        {
            _menuController.OnParticipantLeft(placeId);
        }
    }
    
    private void OnMentalStates(SocketIOEvent e)
    {
        Debug.Log("Update Mental States");
        JSONObject groupMentalStateJsonObject = e.data.GetField("group");
        MentalState groupMentalState = MentalStateFromJsonObject(groupMentalStateJsonObject);
        Dictionary<int, MentalState> participantsMentalStates = new Dictionary<int, MentalState>();
        for (int i = 0; i < e.data.GetField("participants").Count; i++)
        {
            int placeId = (int) e.data.GetField("participants")[i].GetField("placeId").i;
            MentalState participantMentalState =
                MentalStateFromJsonObject(e.data.GetField("participants")[i].GetField("mentalState"));
            participantsMentalStates.Add(placeId, participantMentalState);
        }
        
        this._gameController.UpdateMentalStates(groupMentalState, participantsMentalStates);
    }
    
    private void OnTimeOver(SocketIOEvent e)
    {
        _menuController.OnGroupLeft(true);
        _gameController.TimeOver();
    }

    private MeditationGroup MeditationGroupFromJsonObject(JSONObject groupJson)
    {
        string groupName = groupJson.GetField("name").str;
        bool started = groupJson.GetField("started").b;
        int duration = (int) groupJson.GetField("duration").i;
        List<Participant> participants = new List<Participant>();
        for (int i = 0; i < groupJson.GetField("participants").Count; i++)
        {
            participants.Add(ParticipantFromJsonObject(groupJson.GetField("participants")[i]));
        }
        return new MeditationGroup(groupName, started, duration, participants);
    }
    
    private Participant ParticipantFromJsonObject(JSONObject data)
    {
        string nickname = data.GetField("nickname").str;
        Posture posture = (Posture) Enum.Parse(typeof(Posture), data.GetField("posture").str, true);
        int placeId = (int) data.GetField("placeId").i;
        return new Participant(nickname, posture, placeId);
    }

    private MentalState MentalStateFromJsonObject(JSONObject data)
    {
        float relaxation = data.GetField("relaxation").f;
        bool active = data.GetField("active").b;
        return new MentalState(relaxation, active);
    }
}
