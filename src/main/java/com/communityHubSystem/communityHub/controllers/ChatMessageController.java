package com.communityHubSystem.communityHub.controllers;

import com.communityHubSystem.communityHub.dto.*;
import com.communityHubSystem.communityHub.exception.CommunityHubException;
import com.communityHubSystem.communityHub.models.*;
import com.communityHubSystem.communityHub.services.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final User_ChatRoomService user_chatRoomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;
    private final PostService postService;
    private final MentionService mentionService;
    private final NotificationService notificationService;
    private final CommentService commentService;

    @MessageMapping("/chat")
    public void processMessage(@Payload Map<String, Object> payload) throws ParseException {
        Long roomId = Long.parseLong(payload.get("id").toString());
        String staffId = payload.get("sender").toString();
        System.out.println("SOMETHING" + roomId);
        var user = userService.findByStaffId(staffId.trim()).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception"));
        String content = payload.get("content").toString();
        String dateString = payload.get("date").toString();

        Date date = Date.from(Instant.parse(dateString));
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(ChatRoom.builder().id(roomId).build())
                .date(date)
                .sender(staffId)
                .content(content)
                .build();
        var svgCh = chatMessageService.save(chatMessage);
        messagingTemplate.convertAndSend("/user/chatRoom/queue/messages", new NotificationDtoForChatRoom(
                svgCh.getId(),
                roomId,
                user.getStaffId(),
                content
        ));
    }

    @MessageMapping("/chat-withPhoto")
    public void processMessageWithPhoto(@Payload Map<String, Object> payload) {
        Long roomId = Long.parseLong(payload.get("id").toString());
        String staffId = payload.get("sender").toString();
        Long chatId = Long.parseLong(payload.get("chatId").toString());
        System.out.println("SOMETHING" + roomId);
        var user = userService.findByStaffId(staffId.trim()).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception"));
        String content = payload.get("content").toString();
        messagingTemplate.convertAndSend("/user/chatRoom/queue/messages", new NotificationDtoForChatRoom(
                chatId,
                roomId,
                user.getStaffId(),
                content
        ));
    }

    @MessageMapping("/chat-withVoice")
    public void processMessageWithAudio(@Payload Map<String, Object> payload) {
        Long roomId = Long.parseLong(payload.get("id").toString());
        String staffId = payload.get("sender").toString();
        Long chatId = Long.parseLong(payload.get("chatId").toString());
        System.out.println("SOMETHING" + roomId);
        var user = userService.findByStaffId(staffId.trim()).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception"));
        String voiceUrl = payload.get("voiceUrl").toString();
        messagingTemplate.convertAndSend("/user/chatRoom/queue/messages", new NotificationDtoForAudio(
                chatId,
                roomId,
                user.getStaffId(),
                voiceUrl
        ));
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(@PathVariable("id") Long id) {
        return ResponseEntity.ok(chatMessageService.findChatMessagesByRoomId(id));
    }

    @MessageMapping("/mention-notification")
    public void processMentionUser(@Payload MentionDto mentionDto) {
        var loginUser = userService.findByStaffId(mentionDto.getUserId()).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception!"));
        var post = postService.findById(mentionDto.getPostId());
        List<String> stringList = new ArrayList<>();
        String content = "mentioned you in a post";
        for (String staffId : mentionDto.getUsers()) {
            User mentionedUser = userService.findByStaffId(staffId).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception!"));
            stringList.add(mentionedUser.getStaffId());
            var mention = Mention.builder()
                    .postedUserId(loginUser.getId())
                    .date(new Date())
                    .user(mentionedUser)
                    .post(post)
                    .build();
            mentionService.save(mention);
            var noti = Notification.builder()
                    .content(content)
                    .date(new Date())
                    .user(mentionedUser)
                    .mention(mention)
                    .post(post)
                    .build();
            notificationService.save(noti);
        }
        messagingTemplate.convertAndSend("/user/mention/queue/messages", new MentionDto(
                mentionDto.getPostId(),
                mentionDto.getUserId(),
                stringList,
                content
        ));
    }

    @MessageMapping("/mention-notification-forComment")
    public void mentionForComment(@Payload MentionDto mentionDto) {
        var loginUser = userService.findByStaffId(mentionDto.getUserId()).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception!"));
        var comment = commentService.findById(mentionDto.getPostId());
        var post = postService.findById(comment.getPost().getId());
        List<String> listString = new ArrayList<>();
        String content = "mentioned you in a comment";
        for (String staffId : mentionDto.getUsers()) {
            var mentionedUser = userService.findByStaffId(staffId).orElseThrow(() -> new CommunityHubException("User Name Not Found Exception!"));
            listString.add(mentionedUser.getStaffId());
            var mention = Mention.builder()
                    .postedUserId(loginUser.getId())
                    .date(new Date())
                    .user(mentionedUser)
                    .post(post)
                    .comment(comment)
                    .build();

            mentionService.save(mention);
            var noti = Notification.builder()
                    .content(content)
                    .date(new Date())
                    .user(mentionedUser)
                    .mention(mention)
                    .post(post)
                    .build();
            notificationService.save(noti);
        }
        messagingTemplate.convertAndSend("/user/mention/queue/messages", new MentionDto(
                mentionDto.getPostId(),
                mentionDto.getUserId(),
                listString,
                content
        ));
    }


    @MessageMapping("/event-notification")
    public void eventNotification(@Payload EventNotiDto eventNotiDto) {
        if (eventNotiDto.getStatus().equals(EventNotiDto.Status.PUBLIC)) {
            messagingTemplate.convertAndSend("/user/event-noti/queue/messages", new EventNotiDto(
                    eventNotiDto.getUserId(),
                    eventNotiDto.getContent(),
                    null,
                    eventNotiDto.getStatus()
            ));
        } else {
            messagingTemplate.convertAndSend("/user/event-noti/queue/messages", new EventNotiDto(
                    eventNotiDto.getUserId(),
                    eventNotiDto.getContent(),
                    eventNotiDto.getGroupId(),
                    eventNotiDto.getStatus()
            ));
        }
    }

    @MessageMapping("/delete-message")
    public void deleteMessage(@Payload Map<String, Long> payload) {
        System.out.println("CHATID"+payload.get("chatId"));
        Long id =  payload.get("chatId");
        chatMessageService.deleteById(id);
        messagingTemplate.convertAndSend("/user/remove-divWrapper/queue/messages",new NotificationDtoForChatRoom(
                id,
                null,
                null,
                null
        ));
    }


    @PostMapping("/send-photo-toChatRoom")
    @ResponseBody
    public ResponseEntity<ChatMessage> handleFileUpload(@RequestParam("file") MultipartFile file,
                                              @RequestParam("id") Long id,
                                              @RequestParam("sender") String sender,
                                              @RequestParam("date") String date) throws IOException {
       ChatMessage chatMessage = chatMessageService.saveWithAttachment(id,file,sender,date);
        return ResponseEntity.status(HttpStatus.OK).body(chatMessage);
    }

    @PostMapping("/group-add")
    @ResponseBody
    public ResponseEntity<Map<String, String>> createdGroup(@ModelAttribute ChatRoomGroupDto chatRoomGroupDto) throws IOException {
        user_chatRoomService.createdRoom(chatRoomGroupDto);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Group created successfully");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/upload-voice-message")
    @ResponseBody
    public ResponseEntity<ChatMessage> saveChatMessage(@RequestParam("file") MultipartFile file,
                                                       @RequestParam("id") Long id,
                                                       @RequestParam("sender") String sender,
                                                       @RequestParam("date") String date) throws IOException {

       var chatMessage = chatMessageService.saveWithAudio(file,id,sender,date);
        return ResponseEntity.status(HttpStatus.OK).body(chatMessage);
    }

    @PostMapping("/share-toChatRoom")
    @ResponseBody
    public ResponseEntity<?> shareAndSaveIt(@RequestBody ChatMessageDto chatMessageDto){
        var svgMsg = ChatMessage.builder()
                .chatRoom(ChatRoom.builder().id(chatMessageDto.getRoomId()).build())
                .date(new Date())
                .sender(chatMessageDto.getSender())
                .content(chatMessageDto.getContent())
                .build();
        System.out.println("YOur takdjfksdf"+chatMessageDto.getContent());
        System.out.println("YOur takdjfksdf"+chatMessageDto.getSender());
        System.out.println("YOur takdjfksdf"+chatMessageDto.getRoomId());
        chatMessageService.save(svgMsg);
        return ResponseEntity.status(HttpStatus.OK).body("Share Successful");
    }

}
